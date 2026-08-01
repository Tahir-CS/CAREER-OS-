import { useCallback, useMemo, useState } from 'react';
import { Briefcase, FileText, Upload, Sparkles } from 'lucide-react';
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
    <div className="apple-card p-6 md:p-10">
      <div className="mb-6 flex flex-wrap items-center gap-2.5">
        <Badge variant="outline" className="chip-mono border-none bg-[#0071e3]/10 px-3.5 py-1 text-xs font-semibold text-[#0071e3] rounded-full">
          Resume Upload
        </Badge>
        <Badge variant="outline" className="chip-mono border-none bg-[#34c759]/10 px-3.5 py-1 text-xs font-semibold text-[#34c759] rounded-full">
          Target Role Optimization
        </Badge>
      </div>

      <label
        htmlFor="resume-upload" 
        className={`relative flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center space-y-3.5 rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
          isDragging 
            ? 'border-[#0071e3] bg-[#0071e3]/5 scale-[0.99]' 
            : 'border-[#86868b]/30 bg-[#f5f5f7] hover:border-[#0071e3]/50 hover:bg-[#0071e3]/5'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0071e3] text-white shadow-lg shadow-[#0071e3]/25">
          <Upload className="h-7 w-7" />
        </div>
        <input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
        <div>
          <p className="text-xl font-bold tracking-tight text-[#1d1d1f]">Drop your resume here</p>
          <p className="mt-1 text-sm text-[#86868b]">Upload PDF or DOCX file (Max 5MB)</p>
        </div>
      </label>

      {file && (
        <div className="mt-5 rounded-2xl border border-border/70 bg-[#f5f5f7] p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0071e3] shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1d1d1f]">{file.name}</p>
                <p className="chip-mono text-xs text-[#86868b]">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <span className="rounded-full bg-[#34c759]/15 px-3 py-1 text-xs font-semibold text-[#34c759]">
              Ready
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
        <div className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-[#1d1d1f]">
          <Briefcase className="h-4 w-4 text-[#0071e3]" />
          Target Job Description (Optional)
        </div>
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value.slice(0, MAX_JOB_DESCRIPTION_CHARS))}
          placeholder="Paste the role requirements to perform RAG semantic matching & gap analysis."
          className="min-h-[120px] rounded-xl border border-border/80 bg-[#f5f5f7] text-sm focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
        />
        <div className="mt-2.5 flex items-center justify-between text-xs text-[#86868b]">
          <span>Enables AI Agent 2 to generate 5 targeted interview questions.</span>
          <span className="chip-mono font-semibold">
            {jobDescription.length}/{MAX_JOB_DESCRIPTION_CHARS}
          </span>
        </div>
      </div>

      <Button 
        size="lg" 
        className="apple-button mt-6 h-13 w-full text-base font-semibold"
        disabled={!file || isLoading}
        onClick={handleAnalyze}
      >
        <Sparkles className="mr-2 h-5 w-5" />
        {isLoading ? 'Analyzing Resume...' : 'Analyze Resume'}
      </Button>

      {onUseDemo && (
        <Button
          variant="outline"
          className="apple-button-secondary mt-3 h-12 w-full text-sm font-semibold border-none"
          onClick={onUseDemo}
          disabled={isLoading}
        >
          View Demo Report Layout
        </Button>
      )}
    </div>
  );
};

export default ResumeUploader;
