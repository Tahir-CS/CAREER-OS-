import { useCallback, useMemo, useState } from 'react';
import { BriefcaseBusiness, ChevronDown, FileText, Upload } from 'lucide-react';
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
  const [showTargetRole, setShowTargetRole] = useState(false);

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

  const hasTargetRole = jobDescription.trim().length > 0;

  return (
    <div className="overflow-hidden rounded-[26px] bg-white ring-1 ring-black/[0.06]">
      <div className="border-b border-black/[0.06] px-6 py-5 md:px-8">
        <p className="text-[13px] font-semibold text-[#1d1d1f]">Start with your resume</p>
        <p className="mt-1 text-sm leading-6 text-[#6e6e73]">
          CareerOS reads your experience and skills first. If you do not have a role yet, it can use that profile to find live openings.
        </p>
      </div>

      <div className="p-5 md:p-8">
        <label
          htmlFor="resume-upload"
          className={`group grid min-h-[210px] w-full cursor-pointer place-items-center rounded-[22px] border border-dashed p-6 text-center transition ${
            isDragging
              ? 'border-[#1d1d1f] bg-[#f5f5f7]'
              : 'border-black/[0.16] bg-[#fbfbfd] hover:border-black/[0.28] hover:bg-[#f5f5f7]'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div>
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#1d1d1f] text-white">
              <Upload className="h-4 w-4" />
            </div>
            <input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
            <p className="mt-4 text-base font-semibold tracking-[-0.02em] text-[#1d1d1f]">Drop your resume here</p>
            <p className="mt-1 text-sm text-[#86868b]">or choose a PDF / DOCX up to 5 MB</p>
          </div>
        </label>

        {file && (
          <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[18px] bg-[#f5f5f7] p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d1d1f] ring-1 ring-black/[0.05]">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#1d1d1f]">{file.name}</p>
              <p className="mt-0.5 text-xs text-[#86868b]">{formatFileSize(file.size)}</p>
            </div>
            <span className="text-xs font-medium text-[#6e6e73]">Ready</span>
          </div>
        )}

        <div className="mt-5 border-t border-black/[0.06] pt-5">
          <button
            type="button"
            onClick={() => setShowTargetRole((value) => !value)}
            className="flex w-full items-center justify-between gap-4 text-left"
            aria-expanded={showTargetRole}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7]">
                <BriefcaseBusiness className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[#1d1d1f]">Already found a job?</span>
                <span className="mt-0.5 block text-xs text-[#86868b]">Paste it only if you want to analyze that specific role.</span>
              </span>
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-[#86868b] transition-transform ${showTargetRole ? 'rotate-180' : ''}`} />
          </button>

          {showTargetRole && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="job-description" className="text-xs font-medium text-[#6e6e73]">Target job description</label>
                <span className="text-[11px] tabular-nums text-[#86868b]">{remainingCharacters} chars</span>
              </div>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value.slice(0, MAX_JOB_DESCRIPTION_CHARS))}
                placeholder="Paste the role responsibilities and requirements…"
                className="min-h-[150px] resize-y rounded-[18px] border-black/[0.1] bg-[#fbfbfd] text-sm leading-6 placeholder:text-[#a1a1a6] focus-visible:ring-2 focus-visible:ring-black/10"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            size="lg"
            className="apple-button h-11 flex-1 rounded-full text-sm"
            disabled={!file || isLoading}
            onClick={handleAnalyze}
          >
            {isLoading ? 'Reading resume…' : hasTargetRole ? 'Analyze this role' : 'Find matching jobs'}
          </Button>

          {onUseDemo && (
            <Button
              variant="outline"
              className="apple-button-secondary h-11 rounded-full sm:w-auto"
              onClick={onUseDemo}
              disabled={isLoading}
            >
              Open sample
            </Button>
          )}
        </div>

        {!hasTargetRole && (
          <p className="mt-3 text-center text-xs leading-5 text-[#86868b]">
            No job description required. CareerOS will build a search profile from the resume and look for live roles.
          </p>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;
