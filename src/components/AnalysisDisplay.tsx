import { useState } from 'react';
import { Copy, Download, RotateCcw, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export interface Analysis {
  score: number;
  matchScore?: number | null;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  interviewQuestions?: string[];
  bulletPointRewrites: {
    before: string;
    after: string;
    explanation: string;
  }[];
  atsAnalysis: {
    score: number;
    issues: string[];
    missingKeywords: string[];
    formatWarnings: string[];
  };
}

interface AnalysisDisplayProps {
  analysis: Analysis;
  onReset: () => void;
  onExport: () => void;
}

const scoreLabel = (score: number) => {
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Competitive';
  if (score >= 55) return 'Needs revision';
  return 'Major gaps';
};

const ScoreRow = ({ label, score, note }: { label: string; score: number; note: string }) => (
  <div className="grid gap-3 border-b border-[#d2cabb] py-4 last:border-b-0 sm:grid-cols-[150px_1fr_74px] sm:items-center">
    <div>
      <p className="text-sm font-semibold text-[#17201d]">{label}</p>
      <p className="mt-0.5 text-xs text-[#72776f]">{note}</p>
    </div>
    <div className="h-2 bg-[#ddd6c9]">
      <div className="h-full bg-[#173f35]" style={{ width: `${Math.max(0, Math.min(score, 100))}%` }} />
    </div>
    <div className="flex items-baseline gap-1 sm:justify-end">
      <span className="font-mono text-lg font-semibold text-[#17201d]">{Math.round(score)}</span>
      <span className="font-mono text-[10px] text-[#85877f]">/100</span>
    </div>
  </div>
);

const AnalysisDisplay = ({ analysis, onReset, onExport }: AnalysisDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const {
    score = 0,
    matchScore,
    summary = '',
    strengths = [],
    weaknesses = [],
    improvementSuggestions = [],
    interviewQuestions = [],
    bulletPointRewrites = [],
    atsAnalysis = { score: 0, issues: [], missingKeywords: [], formatWarnings: [] },
  } = analysis;
  const hasRoleMatch = typeof matchScore === 'number' && Number.isFinite(matchScore);

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="border border-[#cfc7b7] bg-[#faf8f2]">
      <div className="grid border-b border-[#cfc7b7] bg-[#173f35] text-[#f8f5ed] md:grid-cols-[1fr_auto] md:items-end">
        <div className="p-6 md:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e99a7e]">Report / 03</p>
          <h2 className="display-serif mt-3 text-4xl leading-none text-[#f8f5ed] md:text-5xl">Application fit report</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#b9c8c2]">{summary}</p>
        </div>
        <div className="border-t border-white/10 p-6 md:min-w-[190px] md:border-l md:border-t-0 md:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#9eb5ac]">Overall signal</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-mono text-5xl font-semibold tracking-[-0.05em] text-white">{score}</span>
            <span className="pb-1 text-xs text-[#9eb5ac]">/ 100</span>
          </div>
          <p className="mt-2 text-xs font-medium text-[#f0b49e]">{scoreLabel(score)}</p>
        </div>
      </div>

      <div className="p-5 md:p-8">
        <div className="flex flex-col gap-2 border-b border-[#d2cabb] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#59615c]">Use the report as a revision checklist, then run the resume again.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copySummary} className="apple-button-secondary h-9 px-3 text-xs">
              <Copy className="mr-1.5 h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy summary'}
            </Button>
            <Button onClick={onExport} className="apple-button h-9 px-3 text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export PDF
            </Button>
            <Button variant="outline" onClick={onReset} className="apple-button-secondary h-9 px-3 text-xs">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> New analysis
            </Button>
          </div>
        </div>

        <div className="grid gap-8 py-7 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow">Score board</p>
            <h3 className="mt-3 text-xl font-semibold">How the application reads</h3>
            <p className="mt-2 text-sm leading-6 text-[#59615c]">
              Document quality and ATS coverage are always shown. Role match appears only when CareerOS has actually compared this resume with a target role.
            </p>
          </div>
          <div className="border-t border-[#d2cabb]">
            <ScoreRow label="Resume quality" score={score} note="Clarity and evidence" />
            <ScoreRow label="ATS coverage" score={atsAnalysis.score} note="Parsing and structure" />
            {hasRoleMatch && <ScoreRow label="Role match" score={matchScore} note="Resume ↔ job similarity" />}
          </div>
        </div>

        <div className="grid border-y border-[#d2cabb] md:grid-cols-2">
          <div className="border-b border-[#d2cabb] p-5 md:border-b-0 md:border-r md:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6eee9] text-[#225a4b]"><Check className="h-3.5 w-3.5" /></span>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#59615c]">Keep</p>
            </div>
            <h3 className="mt-3 text-lg font-semibold">Evidence already working</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#414943]">
              {strengths.length > 0 ? strengths.map((item, index) => (
                <li key={index} className="grid grid-cols-[18px_1fr] gap-2"><span className="font-mono text-[10px] text-[#225a4b]">{String(index + 1).padStart(2, '0')}</span><span>{item}</span></li>
              )) : <li className="text-[#72776f]">No strengths were returned in this report.</li>}
            </ul>
          </div>

          <div className="p-5 md:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f7e6df] text-[#b84f31]"><AlertTriangle className="h-3.5 w-3.5" /></span>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#59615c]">Fix</p>
            </div>
            <h3 className="mt-3 text-lg font-semibold">Weak or missing evidence</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#414943]">
              {weaknesses.length > 0 ? weaknesses.map((item, index) => (
                <li key={index} className="grid grid-cols-[18px_1fr] gap-2"><span className="font-mono text-[10px] text-[#b84f31]">{String(index + 1).padStart(2, '0')}</span><span>{item}</span></li>
              )) : <li className="text-[#72776f]">No major weaknesses were returned.</li>}
            </ul>
          </div>
        </div>

        <div className="grid gap-8 border-b border-[#d2cabb] py-7 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow">Revision queue</p>
            <h3 className="mt-3 text-xl font-semibold">What to change next</h3>
            <p className="mt-2 text-sm leading-6 text-[#59615c]">Work top to bottom; each item should result in an actual resume edit.</p>
          </div>
          <ol className="border-t border-[#d2cabb]">
            {improvementSuggestions.length > 0 ? improvementSuggestions.map((item, index) => (
              <li key={index} className="grid grid-cols-[42px_1fr_auto] items-start gap-3 border-b border-[#d2cabb] py-4">
                <span className="font-mono text-xs text-[#b84f31]">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-sm leading-6 text-[#414943]">{item}</span>
                <ArrowRight className="mt-1 h-4 w-4 text-[#8d9088]" />
              </li>
            )) : <li className="py-4 text-sm text-[#72776f]">No revision recommendations were returned.</li>}
          </ol>
        </div>

        {bulletPointRewrites.length > 0 && (
          <div className="border-b border-[#d2cabb] py-7">
            <div className="mb-5">
              <p className="eyebrow">Bullet workshop</p>
              <h3 className="mt-3 text-xl font-semibold">Before → after</h3>
            </div>
            <div className="grid gap-4">
              {bulletPointRewrites.map((rewrite, index) => (
                <div key={index} className="grid border border-[#d2cabb] md:grid-cols-2">
                  <div className="border-b border-[#d2cabb] bg-[#e9e4d8] p-4 md:border-b-0 md:border-r">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#85877f]">Original</p>
                    <p className="mt-2 text-sm leading-6 text-[#59615c]">{rewrite.before}</p>
                  </div>
                  <div className="p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#225a4b]">Revision</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-[#17201d]">{rewrite.after}</p>
                    <p className="mt-3 border-l-2 border-[#e86e45] pl-3 text-xs leading-5 text-[#72776f]">{rewrite.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 border-b border-[#d2cabb] py-7 md:grid-cols-2">
          <div className="border border-[#d2cabb] bg-[#f3f0e7] p-5">
            <p className="eyebrow">ATS / missing terms</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {atsAnalysis.missingKeywords.length > 0 ? atsAnalysis.missingKeywords.map((keyword, index) => (
                <span key={index} className="border border-[#c7bfb0] bg-[#faf8f2] px-2.5 py-1.5 font-mono text-[10px] text-[#173f35]">{keyword}</span>
              )) : <p className="text-sm text-[#72776f]">No role-specific missing terms were returned.</p>}
            </div>
          </div>
          <div className="border border-[#d2cabb] bg-[#f3f0e7] p-5">
            <p className="eyebrow">ATS / parsing notes</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[#59615c]">
              {[...atsAnalysis.issues, ...atsAnalysis.formatWarnings].length > 0
                ? [...atsAnalysis.issues, ...atsAnalysis.formatWarnings].map((issue, index) => <li key={index}>— {issue}</li>)
                : <li>No major ATS formatting flags detected.</li>}
            </ul>
          </div>
        </div>

        {interviewQuestions.length > 0 && (
          <div className="py-7">
            <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="eyebrow">Interview handoff</p>
                <h3 className="mt-3 text-xl font-semibold">Questions worth practising</h3>
                <p className="mt-2 text-sm leading-6 text-[#59615c]">These are derived from gaps and evidence in this report.</p>
              </div>
              <ol className="border-t border-[#d2cabb]">
                {interviewQuestions.map((question, index) => (
                  <li key={index} className="grid grid-cols-[42px_1fr] gap-3 border-b border-[#d2cabb] py-4">
                    <span className="font-mono text-xs text-[#b84f31]">Q{index + 1}</span>
                    <span className="text-sm leading-6 text-[#414943]">{question}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AnalysisDisplay;
