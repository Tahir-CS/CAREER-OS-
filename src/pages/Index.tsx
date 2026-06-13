import { useState } from 'react';
import { useToast } from "../components/ui/use-toast";
import Header from '../components/Header';
import ResumeUploader from '../components/ResumeUploader';
import AnalysisDisplay from '../components/AnalysisDisplay';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

const mockAnalysis = {
  score: 88,
  summary: "Your resume demonstrates strong professional experience with quantifiable achievements, but could benefit from some structural improvements and ATS optimization.",
  strengths: [
    "Clearly articulated project impacts with quantifiable results",
    "Strong action verbs used throughout the experience section",
    "Well-structured and easy to read format"
  ],
  weaknesses: [
    "Missing professional summary section",
    "Skills section needs better organization",
    "Some bullet points lack specific metrics"
  ],
  improvementSuggestions: [
    "Add a compelling professional summary at the top",
    "Group skills by category (e.g., Technical, Soft Skills, Tools)",
    "Include more quantifiable achievements in work experience",
    "Use industry-specific keywords throughout"
  ],
  bulletPointRewrites: [
    {
      before: "Managed team projects and improved efficiency",
      after: "Led 5-person development team to increase sprint velocity by 40% through agile process optimization",
      explanation: "Added specific numbers and clear outcome metrics"
    }
  ],
  atsAnalysis: {
    score: 75,
    issues: [
      "Resume uses some graphical elements that may not parse correctly",
      "Complex formatting in header could cause issues"
    ],
    missingKeywords: [
      "project management",
      "agile methodologies",
      "cross-functional collaboration"
    ],
    formatWarnings: [
      "Remove header images and use plain text",
      "Avoid tables for skills section"
    ]
  }
};

const Index = () => {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (file: File) => {
    console.log("Analyzing file:", file.name);
    setIsLoading(true);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const message = await readApiErrorMessage(response, 'Failed to analyze resume.');
        throw new Error(message);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to analyze resume');
      }
      setAnalysis(data.analysis);
      setFeedbackId(data.feedbackId);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to analyze resume. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setFeedbackId(null);
  };

  // PDF Export Handler (fixed: use feedbackId and GET request)
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
      a.download = 'AI-Resume-Feedback.pdf';
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
              <p className="text-lg text-muted-foreground">Analyzing your resume... This might take a moment.</p>
            </div>
          )}



          {analysis && <AnalysisDisplay analysis={analysis} onReset={handleReset} onExport={handleExport} />}
        </div>
      </main>
    </div>
  );
};

export default Index;
