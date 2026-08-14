import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
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
  UPLOADING: { title: 'Uploading document', detail: 'Sending the resume to secure object storage.' },
  PENDING: { title: 'Queued for analysis', detail: 'The document is waiting for an available worker.' },
  PARSING: { title: 'Reading the resume', detail: 'Extracting structured text and preparing the document for comparison.' },
  ANALYZING: { title: 'Building the report', detail: 'Comparing evidence, role signals, ATS coverage, and revision opportunities.' },
};

const Index = () => {
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysis, setAnalysis] = useState<any>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [jobStatus, setJobStatus] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [currentFilename, setCurrentFilename] = useState('Uploaded-Resume.pdf');

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

  useEffect(() => {
    if (!socket || !feedbackId) return;

    socket.emit('subscribe-to-job', feedbackId);
    socket.on('job-update', async (data) => {
      setJobStatus(data.status);

      if (data.status === 'COMPLETED') {
        try {
          const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`);
          if (!response.ok) throw new Error('Failed to fetch final results');
          const result = await response.json();

          if (result.success && result.feedback) {
            setAnalysis(result.feedback);
            saveReportToHistory(currentFilename, result.feedback);
            setIsLoading(false);
            toast({ title: 'Report ready', description: 'The analysis has been saved to your history.' });
          } else {
            throw new Error('The analysis completed without a report payload.');
          }
        } catch (error) {
          console.error('Error fetching final feedback:', error);
          setIsLoading(false);
          toast({
            title: 'Could not load report',
            description: error instanceof Error ? error.message : 'Please try the analysis again.',
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
    });

    return () => socket.off('job-update');
  }, [socket, feedbackId, toast, currentFilename]);

  const handleAnalyze = async ({ file, jobDescription }: AnalyzePayload) => {
    setCurrentFilename(file.name);
    setIsLoading(true);
    setAnalysis(null);
    setJobStatus('UPLOADING');

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
      if (!data.success) throw new Error(data.message || 'Failed to queue resume');

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
  };

  const handleReset = () => {
    setAnalysis(null);
    setFeedbackId(null);
    setJobStatus('');
  };

  const handleExport = async () => {
    if (!analysis || !feedbackId) {
      toast({
        title: 'Export unavailable',
        description: 'No feedback ID was found. Please re-analyze your resume.',
        variant: 'destructive',
      });
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
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resume-Feedback-${feedbackId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Could not export PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const status = statusCopy[jobStatus] || { title: 'Processing document', detail: 'Preparing your report.' };
  const statuses = ['UPLOADING', 'PENDING', 'PARSING', 'ANALYZING'];
  const activeIndex = Math.max(statuses.indexOf(jobStatus), 0);

  return (
    <div className="min-h-screen bg-[#f3f0e7] text-[#17201d]">
      <Header />

      <main className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <div className="grid gap-8 border-b border-[#d2cabb] py-9 md:grid-cols-[1fr_auto] md:items-end md:py-12">
          <div>
            <p className="rule-label">Workspace / 01</p>
            <h1 className="display-serif mt-4 max-w-3xl text-4xl leading-[1] md:text-6xl">Resume workbench</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#59615c]">
              Put the resume and the role in the same place. CareerOS turns the comparison into a report you can revise against.
            </p>
          </div>
          <div className="hidden min-w-[220px] border-l border-[#d2cabb] pl-5 md:block">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#878981]">Current workflow</p>
            <p className="mt-2 text-sm font-medium">Input → compare → revise</p>
          </div>
        </div>

        <div className="mx-auto mt-9 max-w-4xl">
          {!analysis && !isLoading && <ResumeUploader onAnalyze={handleAnalyze} />}

          {isLoading && (
            <div className="border border-[#cfc7b7] bg-[#faf8f2]">
              <div className="grid border-b border-[#cfc7b7] bg-[#e9e4d8] sm:grid-cols-[110px_1fr]">
                <div className="border-b border-[#cfc7b7] p-4 sm:border-b-0 sm:border-r">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#b84f31]">Process / 02</span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold">{status.title}</p>
                  <p className="mt-1 text-xs text-[#59615c]">{status.detail}</p>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid gap-2 sm:grid-cols-4">
                  {['Upload', 'Queue', 'Read', 'Report'].map((label, index) => {
                    const done = index < activeIndex;
                    const active = index === activeIndex;
                    return (
                      <div key={label}>
                        <div className={`h-1.5 w-full ${done || active ? 'bg-[#173f35]' : 'bg-[#ddd6c9]'}`} />
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`font-mono text-[10px] uppercase ${active ? 'text-[#17201d]' : 'text-[#85877f]'}`}>{label}</span>
                          {active && <span className="h-2 w-2 animate-pulse rounded-full bg-[#e86e45]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-8 border-l-2 border-[#e86e45] pl-4 text-sm leading-6 text-[#59615c]">
                  Keep this page open. The report updates when the background worker finishes the analysis.
                </p>
              </div>
            </div>
          )}

          {analysis && <AnalysisDisplay analysis={analysis} onReset={handleReset} onExport={handleExport} />}
        </div>
      </main>
    </div>
  );
};

export default Index;
