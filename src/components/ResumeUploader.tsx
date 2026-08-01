import { useCallback, useMemo, useState } from 'react';
import { Briefcase, FileText, Upload, WandSparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

const MAX_JOB_DESCRIPTION_CHARS = 5000;

export interface AnalyzePayload {
  file: File;
  jobDescription: string;
}

interface ResumeUploaderProps {
  onAnalyze: (payload: AnalyzePayload) => void;
  isLoading?: boolean;
  onUseDemo?: () => void;
}

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const ResumeUploader = ({ onAnalyze, isLoading = false, onUseDemo }: ResumeUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  const remainingCharacters = useMemo(
    () => MAX_JOB_DESCRIPTION_CHARS - jobDescription.length,
    [jobDescription.length]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleAnalyze = () => {
    if (!file || isLoading) {
      return;
    }

    onAnalyze({
      file,
      jobDescription: jobDescription.trim(),
    });
  };

  return (
    <div className="brutalist-card reveal-up p-6 md:p-8">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="chip-mono border-2 border-border bg-white text-black dark:bg-black dark:text-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">Resume Upload</Badge>
        <Badge variant="outline" className="chip-mono border-2 border-border bg-accent text-accent-foreground rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">Optional Job Targeting</Badge>
      </div>

      <label
        htmlFor="resume-upload" 
        className={`relative flex min-h-[230px] w-full cursor-pointer flex-col items-center justify-center space-y-4 overflow-hidden border-4 border-dashed p-5 text-center transition-all duration-300 ${isDragging ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="relative border-4 border-black bg-white dark:bg-black dark:border-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <Upload className="h-10 w-10 text-foreground" />
        </div>
        <input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
        <p className="font-display text-2xl font-bold text-foreground md:text-3xl">Drop resume file here</p>
        <p className="max-w-md text-sm text-muted-foreground md:text-base">Upload a PDF or DOCX and optionally add a target job description to get tailored feedback.</p>
        <p className="chip-mono text-xs uppercase text-muted-foreground">PDF or DOCX · Max 5 MB</p>
      </label>

      {file && (
        <div className="mt-5 border-2 border-border bg-secondary/20 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-1 flex items-center gap-2 text-sm font-bold text-foreground uppercase">
                <FileText className="h-4 w-4" />
                Selected Resume
              </p>
              <p className="truncate text-sm text-foreground font-mono">{file.name}</p>
            </div>
            <span className="chip-mono bg-border text-background px-3 py-1 text-xs font-bold">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>
      )}

      <div className="mt-5 border-2 border-border bg-white dark:bg-black p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground uppercase">
          <Briefcase className="h-4 w-4 text-accent" />
          Target Job Description
        </div>
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value.slice(0, MAX_JOB_DESCRIPTION_CHARS))}
          placeholder="Optional: paste the role description to get more specific keyword and ATS feedback."
          className="min-h-[130px] border-2 border-border rounded-none bg-background text-sm font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-foreground font-bold uppercase">Optional but recommended for role-specific scoring.</span>
          <span className={`chip-mono font-bold ${remainingCharacters < 350 ? 'text-destructive' : 'text-foreground'}`}>
            {jobDescription.length}/{MAX_JOB_DESCRIPTION_CHARS}
          </span>
        </div>
      </div>

      <Button 
        size="lg" 
        className="mt-6 h-14 w-full text-lg font-bold rounded-none brutalist-button uppercase tracking-wider"
        disabled={!file || isLoading}
        onClick={handleAnalyze}
      >
        <WandSparkles className="mr-2 h-5 w-5" />
        {isLoading ? 'Analyzing...' : 'Analyze Resume'}
      </Button>

      {onUseDemo && (
        <Button
          variant="outline"
          className="mt-4 h-12 w-full text-sm font-bold rounded-none border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none"
          onClick={onUseDemo}
          disabled={isLoading}
        >
          Use Demo Analysis Layout
        </Button>
      )}
    </div>
  );
};

export default ResumeUploader;
