import { useCallback, useMemo, useState } from 'react';
import { Briefcase, FileText, Upload } from 'lucide-react';
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
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] md:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#222]">New analysis</p>
          <p className="mt-1 text-sm text-[#777]">Add your resume first. The job description is optional, but improves role-specific results.</p>
        </div>
        <span className="shrink-0 rounded-md bg-[#f1f1ee] px-2.5 py-1 text-xs font-medium text-[#666]">PDF / DOCX</span>
      </div>

      <label
        htmlFor="resume-upload"
        className={`flex min-h-[190px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition ${
          isDragging ? 'border-[#333] bg-[#f4f4f0]' : 'border-black/15 bg-[#fafaf8] hover:border-black/30 hover:bg-[#f7f7f3]'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-[#333]">
          <Upload className="h-4 w-4" />
        </div>
        <input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
        <p className="mt-4 text-sm font-semibold text-[#222]">Drop a resume here, or choose a file</p>
        <p className="mt-1 text-xs text-[#888]">PDF or DOCX, up to 5 MB</p>
      </label>

      {file && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-[#f7f7f5] p-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#333] ring-1 ring-black/5">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#222]">{file.name}</p>
              <p className="mt-0.5 text-xs text-[#888]">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <span className="text-xs font-medium text-[#4f6d3a]">Ready</span>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="job-description" className="flex items-center gap-2 text-sm font-medium text-[#333]">
            <Briefcase className="h-4 w-4 text-[#777]" />
            Job description
            <span className="font-normal text-[#999]">optional</span>
          </label>
          <span className="text-xs tabular-nums text-[#999]">{remainingCharacters} left</span>
        </div>
        <Textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value.slice(0, MAX_JOB_DESCRIPTION_CHARS))}
          placeholder="Paste the role description here to compare your resume against it."
          className="min-h-[145px] resize-y rounded-xl border-black/10 bg-[#fafaf8] text-sm leading-6 placeholder:text-[#aaa] focus-visible:ring-1 focus-visible:ring-[#333]"
        />
      </div>

      <Button
        size="lg"
        className="apple-button mt-5 h-11 w-full text-sm"
        disabled={!file || isLoading}
        onClick={handleAnalyze}
      >
        {isLoading ? 'Analyzing…' : 'Analyze resume'}
      </Button>

      {onUseDemo && (
        <Button
          variant="outline"
          className="apple-button-secondary mt-2.5 h-11 w-full text-sm"
          onClick={onUseDemo}
          disabled={isLoading}
        >
          View sample report
        </Button>
      )}
    </div>
  );
};

export default ResumeUploader;
