import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from "../components/ui/use-toast";
import Header from '../components/Header';
import ResumeUploader from '../components/ResumeUploader';
import AnalysisDisplay from '../components/AnalysisDisplay';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
// Socket.io runs on the base URL, not the /api route
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
    if (typeof data?.message === 'string' && data.message.trim().length > 0) {
      return data.message;
    }
  } catch (error) {
    // Fall back to a status-based message when body is not JSON.
  }
  return fallback;
};

const Index = () => {
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysis, setAnalysis] = useState<any>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Real-time WebSocket State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  // 0. Initialize Anonymous Session ID
  useEffect(() => {
    let sid = localStorage.getItem('career_os_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('career_os_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  // 1. Initialize Socket.io Connection on mount
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  // 2. Listen for Job Updates when feedbackId is set
  useEffect(() => {
    if (!socket || !feedbackId) return;

    // Tell the server we want to listen to events for this specific job
    socket.emit('subscribe-to-job', feedbackId);

    // Listen for the Worker's real-time broadcasts
    socket.on('job-update', async (data) => {
      console.log("[WebSocket] Job update:", data);
      setJobStatus(data.status);

      if (data.status === 'COMPLETED') {
        // The Worker is done! Fetch the final JSON from Postgres
        try {
          const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`);
          if (!response.ok) throw new Error('Failed to fetch final results');
          const result = await response.json();
          if (result.success) {
            setAnalysis(result.feedback);
            setIsLoading(false);
            toast({ title: "Analysis Complete!", description: "Your resume has been fully analyzed." });
          }
        } catch (error) {
          console.error("Error fetching final feedback:", error);
          setIsLoading(false);
        }
      } else if (data.status === 'FAILED') {
        setIsLoading(false);
        toast({
          title: "Analysis Failed",
          description: data.error || "The AI worker encountered an error.",
          variant: "destructive",
        });
      }
    });

    return () => {
      socket.off('job-update');
    };
  }, [socket, feedbackId, toast]);

  const handleAnalyze = async (file: File) => {
    console.log("Queueing file for analysis:", file.name);
    setIsLoading(true);
    setAnalysis(null);
    setJobStatus('UPLOADING');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }

      // We hit the new Event-Driven API endpoint
      const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const message = await readApiErrorMessage(response, 'Failed to queue resume.');
        throw new Error(message);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to queue resume');
      }
      
      // We got the Job ID instantly! Now we wait for the WebSockets to do the rest.
      setFeedbackId(data.jobId);
      setJobStatus(data.status || 'PENDING');
      
    } catch (error) {
      console.error('Error queueing resume:', error);
      setIsLoading(false);
      setJobStatus('');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to queue resume. Please try again.',
        variant: "destructive",
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
        title: 'Export Failed',
        description: 'No feedback ID found. Please re-analyze your resume.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/download`, {
        method: 'GET',
      });
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
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Could not export PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Transform Your Resume with AI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Get instant feedback, a hireability score, and tailored suggestions to make your resume stand out.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {!analysis && !isLoading && <ResumeUploader onAnalyze={handleAnalyze} />}
          
          {isLoading && (
            <div className="text-center p-16 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              
              <div className="text-xl font-semibold text-primary flex items-center space-x-2">
                {jobStatus === 'UPLOADING' && <span>Uploading to MinIO Storage...</span>}
                {jobStatus === 'PENDING' && <span>Waiting in Queue...</span>}
                {jobStatus === 'PARSING' && <span>AI Agent 1: Parsing PDF Text...</span>}
                {jobStatus === 'ANALYZING' && <span>AI Agent 2: Synthesizing Feedback...</span>}
                {!['UPLOADING', 'PENDING', 'PARSING', 'ANALYZING'].includes(jobStatus) && <span>Processing...</span>}
              </div>
              <p className="text-sm text-muted-foreground">Watching live events via WebSockets</p>
            </div>
          )}

          {analysis && <AnalysisDisplay analysis={analysis} onReset={handleReset} onExport={handleExport} />}
        </div>
      </main>
    </div>
  );
};

export default Index;
