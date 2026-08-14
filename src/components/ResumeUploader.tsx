import { useCallback, useMemo, useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

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
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
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
    if (!file || isLoading) return;
    onAnalyze({ file, jobDescription: jobDescription.trim() });
  };

  return (
    <div className="overflow-hidden border border-[#cfc7b7] bg-[#faf8f2]">
      <div className="grid border-b border-[#cfc7b7] bg-[#e9e4d8] sm:grid-cols-[110px_1fr]">
        <div className="border-b border-[#cfc7b7] p-4 sm:border-b-0 sm:border-r">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#b84f31]">Input / 01</span>
        </div>
        <div className="p-4">
          <p className="text-sm font-semibold text-[#17201d]">Document intake</p>
          <p className="mt-1 text-xs leading-5 text-[#59615c]">Resume required. Add the role description when you want a role-specific match.</p>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <label
          htmlFor="resume-upload"
          className={`group grid min-h-[180px] w-full cursor-pointer place-items-center border border-dashed p-6 text-center transition ${
            isDragging
              ? 'border-[#173f35] bg-[#e6eee9]'
              : 'border-[#bdb5a7] bg-[#f3f0e7] hover:border-[#7b8f87] hover:bg-[#eeeae0]'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div>
            <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[#c7beaf] bg-[#faf8f2] text-[#173f35] transition group-hover:border-[#8ea49b]">
              <Upload className="h-4 w-4" />
            </div>
            <input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
            <p className="mt-4 text-sm font-semibold text-[#17201d]">Drop your resume here</p>
            <p className="mt-1 text-xs text-[#72776f]">or click to choose a PDF / DOCX up to 5 MB</p>
          </div>
        </label>

        {file && (
          <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 border border-[#cfc7b7] bg-[#e9e4d8] p-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[#173f35] text-[#f8f5ed]">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#17201d]">{file.name}</p>
              <p className="font-mono text-[10px] text-[#72776f]">{formatFileSize(file.size)}</p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#225a4b]">Ready</span>
          </div>
        )}

        <div className="mt-6 border-t border-[#d2cabb] pt-5">
          <div className="mb-2.5 flex items-end justify-between gap-3">
            <div>
              <label htmlFor="job-description" className="text-sm font-semibold text-[#17201d]">Target job description</label>
              <p className="mt-0.5 text-xs text-[#72776f]">Optional, but recommended for fit and gap analysis.</p>
            </div>
            <span className="font-mono text-[10px] tabular-nums text-[#85877f]">{remainingCharacters} chars</span>
          </div>
          <Textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value.slice(0, MAX_JOB_DESCRIPTION_CHARS))}
            placeholder="Paste the role responsibilities and requirements…"
            className="min-h-[150px] resize-y rounded-none border-[#cfc7b7] bg-[#f7f4ec] text-sm leading-6 placeholder:text-[#96988f] focus-visible:ring-1 focus-visible:ring-[#173f35]"
          />
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            size="lg"
            className="apple-button h-11 flex-1 text-sm"
            disabled={!file || isLoading}
            onClick={handleAnalyze}
          >
            {isLoading ? 'Running analysis…' : 'Run analysis'}
          </Button>

          {onUseDemo && (
            <Button
              variant="outline"
              className="apple-button-secondary h-11 sm:w-auto"
              onClick={onUseDemo}
              disabled={isLoading}
            >
              Open sample
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;
