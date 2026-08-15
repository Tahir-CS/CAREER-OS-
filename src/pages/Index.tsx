import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import Header from '../components/Header';
import ResumeUploader, { AnalyzePayload } from '../components/ResumeUploader';
import AnalysisDisplay from '../components/AnalysisDisplay';
import { saveReportToHistory } from './History';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3001';

const getStatusFallbackMessage = (status: number, defaultMessage: string) => {
  if (status === 400) return 'Invalid request. Please check the uploaded file and inputs.';
  if (status === 413) return 'Payload too large. Try a smaller file or shorter job description.';
  if (status === 503) return 'Analysis service is temporarily unavailable. Please try again shortly.';
  return defaultMessage;
};

const readApiErrorMessage = async (response: Response, defaultMessage: string) => {
  const fallback = getStatusFallbackMessage(response.status, defaultMessage);
  try {
    const data = await response.json();
    if (typeof data?.message === 'string' && data.message.trim().length > 0) return data.message;
  } catch {
    // Use the status-based fallback when the response body is not JSON.
  }
  return fallback;
};

const statusCopy: Record<string, { title: string; detail: string }> = {
  UPLOADING: { title: 'Uploading resume', detail: 'Storing the document before analysis starts.' },
  PENDING: { title: 'Queued', detail: 'Your resume is waiting for an available worker.' },
  PARSING: { title: 'Reading your experience', detail: 'Extracting the resume text and identifying usable evidence.' },
  ANALYZING: { title: 'Building your career profile', detail: 'Identifying realistic roles, skills, seniority, and application evidence.' },
};

interface InitialRouteState {
  initialUpload?: AnalyzePayload;
}

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysis, setAnalysis] = useState<any>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [jobStatus, setJobStatus] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [currentFilename, setCurrentFilename] = useState('Uploaded-Resume.pdf');
  const discoverAfterAnalysisRef = useRef(false);
  const completedJobRef = useRef<string | null>(null);
  const initialUploadHandledRef = useRef(false);

  useEffect(() => {
    let sid = localStorage.getItem('career_os_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('career_os_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const finishJob = useCallback((jobId: string, feedback: unknown) => {
    if (completedJobRef.current === jobId) return;
    completedJobRef.current = jobId;
    setAnalysis(feedback);
    saveReportToHistory(currentFilename, feedback);
    setIsLoading(false);
    setJobStatus('COMPLETED');

    if (discoverAfterAnalysisRef.current) {
      navigate(`/jobs?analysisId=${encodeURIComponent(jobId)}`, { replace: true });
      return;
    }

    toast({ title: 'Application report ready', description: 'The role-specific analysis has been saved to your history.' });
  }, [currentFilename, navigate, toast]);

  const fetchFeedback = useCallback(async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/feedback/${jobId}`);
    if (!response.ok) throw new Error('Failed to fetch analysis status.');
    const result = await response.json();
    if (result.status) setJobStatus(result.status);
    if (result.status === 'COMPLETED' && result.feedback) finishJob(jobId, result.feedback);
    if (result.status === 'FAILED') throw new Error('The analysis worker could not complete this resume.');
    return result;
  }, [finishJob]);

  useEffect(() => {
    if (!socket || !feedbackId) return;

    socket.emit('subscribe-to-job', feedbackId);
    const handleUpdate = async (data: { status: string; error?: string }) => {
      setJobStatus(data.status);
      if (data.status === 'COMPLETED') {
        try {
          await fetchFeedback(feedbackId);
        } catch (error) {
          setIsLoading(false);
          toast({
            title: 'Could not load result',
            description: error instanceof Error ? error.message : 'Please try again.',
            variant: 'destructive',
          });
        }
      } else if (data.status === 'FAILED') {
        setIsLoading(false);
        toast({
          title: 'Analysis failed',
          description: data.error || 'The analysis worker returned an error.',
          variant: 'destructive',
        });
      }
    };

    socket.on('job-update', handleUpdate);
    return () => {
      socket.off('job-update', handleUpdate);
    };
  }, [socket, feedbackId, fetchFeedback, toast]);

  useEffect(() => {
    if (!feedbackId || !isLoading) return;
    const timer = window.setInterval(() => {
      fetchFeedback(feedbackId).catch((error) => {
        console.error('Polling analysis status failed:', error);
      });
    }, 2500);
    return () => window.clearInterval(timer);
  }, [feedbackId, isLoading, fetchFeedback]);

  const handleAnalyze = useCallback(async ({ file, jobDescription }: AnalyzePayload) => {
    setCurrentFilename(file.name);
    setIsLoading(true);
    setAnalysis(null);
    setJobStatus('UPLOADING');
    completedJobRef.current = null;
    discoverAfterAnalysisRef.current = !jobDescription;

    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription) formData.append('jobDescription', jobDescription);
      if (sessionId) formData.append('sessionId', sessionId);

      const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const message = await readApiErrorMessage(response, 'Failed to queue resume.');
        throw new Error(message);
      }

      const data = await response.json();
      if (!data.success || !data.jobId) throw new Error(data.message || 'Failed to queue resume');

      setFeedbackId(data.jobId);
      setJobStatus(data.status || 'PENDING');
    } catch (error) {
      console.error('Error queueing resume:', error);
      setIsLoading(false);
      setJobStatus('');
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to queue resume. Please try again.',
        variant: 'destructive',
      });
    }
  }, [sessionId, toast]);

  useEffect(() => {
    const preparedJobId = searchParams.get('jobId');
    if (!preparedJobId) return;
    completedJobRef.current = null;
    discoverAfterAnalysisRef.current = false;
    setFeedbackId(preparedJobId);
    setIsLoading(true);
    setAnalysis(null);
    setJobStatus('PENDING');
    fetchFeedback(preparedJobId).catch((error) => {
      setIsLoading(false);
      toast({
        title: 'Could not open application',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    });
  }, [searchParams, fetchFeedback, toast]);

  useEffect(() => {
    const routeState = location.state as InitialRouteState | null;
    if (!routeState?.initialUpload || initialUploadHandledRef.current || !sessionId) return;
    initialUploadHandledRef.current = true;
    handleAnalyze(routeState.initialUpload);
    navigate('/app', { replace: true, state: null });
  }, [location.state, sessionId, handleAnalyze, navigate]);

  const handleReset = () => {
    setAnalysis(null);
    setFeedbackId(null);
    setJobStatus('');
    discoverAfterAnalysisRef.current = false;
    completedJobRef.current = null;
    navigate('/app', { replace: true });
  };

  const handleExport = async () => {
    if (!analysis || !feedbackId) {
      toast({ title: 'Export unavailable', description: 'No feedback ID was found.', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/download`, { method: 'GET' });
      if (!response.ok) {
        const message = await readApiErrorMessage(response, 'Could not export PDF. Please try again.');
        throw new Error(message);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `CareerOS-${feedbackId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Could not export PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const status = statusCopy[jobStatus] || { title: 'Processing resume', detail: 'Preparing the next step.' };
  const statuses = ['UPLOADING', 'PENDING', 'PARSING', 'ANALYZING'];
  const activeIndex = Math.max(statuses.indexOf(jobStatus), 0);
  const prepared = searchParams.get('prepared') === '1';

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <Header />

      <main className="mx-auto max-w-[1080px] px-5 pb-20 pt-10 md:px-8 md:pt-16">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="text-[13px] font-semibold text-[#6e6e73]">{prepared ? 'Application workspace' : 'Job discovery'}</p>
          <h1 className="mt-3 text-[46px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[58px] md:text-[72px]">
            {prepared ? 'Prepare for this role.' : 'Upload your resume. Find your next role.'}
          </h1>
          <p className="mx-auto mt-5 max-w-[680px] text-[18px] leading-7 tracking-[-0.02em] text-[#6e6e73]">
            {prepared
              ? 'CareerOS is comparing the selected live job with the same resume you already uploaded.'
              : 'We turn your real experience into a career profile, search live openings, and show the jobs your resume can support.'}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-[860px]">
          {!analysis && !isLoading && <ResumeUploader onAnalyze={handleAnalyze} />}

          {isLoading && (
            <section className="overflow-hidden rounded-[28px] bg-white ring-1 ring-black/[0.05]">
              <div className="border-b border-black/[0.06] px-6 py-5 md:px-8">
                <p className="text-sm font-semibold">{status.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#6e6e73]">{status.detail}</p>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid gap-3 sm:grid-cols-4">
                  {['Upload', 'Queue', 'Read', prepared ? 'Compare' : 'Profile'].map((label, index) => {
                    const done = index < activeIndex;
                    const active = index === activeIndex;
                    return (
                      <div key={label}>
                        <div className={`h-1.5 w-full rounded-full ${done || active ? 'bg-[#1d1d1f]' : 'bg-[#e5e5e7]'}`} />
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-[11px] font-medium ${active ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>{label}</span>
                          {active && <span className="h-2 w-2 animate-pulse rounded-full bg-[#1d1d1f]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-8 text-sm leading-6 text-[#6e6e73]">
                  {discoverAfterAnalysisRef.current
                    ? 'When the career profile is ready, CareerOS will move directly into live job matches.'
                    : 'When the comparison finishes, the role-specific application report will appear here.'}
                </p>
              </div>
            </section>
          )}

          {analysis && !discoverAfterAnalysisRef.current && (
            <AnalysisDisplay analysis={analysis} onReset={handleReset} onExport={handleExport} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
