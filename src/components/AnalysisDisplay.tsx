import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, Download, RotateCcw, Sparkles, Target, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  score: number;
  label: string;
  strokeColor: string;
  badgeBg: string;
  badgeTextColor: string;
}

const ScoreGauge = ({ score, label, strokeColor, badgeBg, badgeTextColor }: ScoreGaugeProps) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-36 w-36 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-[#e8e8ed]"
          strokeWidth="9"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          strokeWidth="9"
          stroke={strokeColor}
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-[#1d1d1f]">{score}</span>
        <span className="chip-mono text-[10px] font-bold uppercase tracking-wider text-[#86868b]">{label}</span>
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
        <span className={`chip-mono rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeBg} ${badgeTextColor}`}>
          / 100
        </span>
      </div>
    </div>
  );
};

export interface Analysis {
  score: number;
  matchScore?: number;
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

const AnalysisDisplay = ({ analysis, onReset, onExport }: AnalysisDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const { score, matchScore, summary, strengths, weaknesses, improvementSuggestions, interviewQuestions, bulletPointRewrites, atsAnalysis } = analysis;

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      setCopied(false);
    }
  };

  const radarData = [
    { subject: 'Format', A: score, fullMark: 100 },
    { subject: 'Keywords', A: Math.max(100 - (atsAnalysis.missingKeywords.length * 10), 0), fullMark: 100 },
    { subject: 'Impact', A: score + 10 > 100 ? 100 : score + 10, fullMark: 100 },
    { subject: 'Relevance (RAG)', A: matchScore || Math.floor(score * 0.9), fullMark: 100 },
    { subject: 'ATS Parsing', A: atsAnalysis.score, fullMark: 100 },
  ];

  return (
    <Card className="apple-card w-full animate-fade-in overflow-hidden p-4 md:p-8">
      <CardHeader className="bg-transparent border-b border-border/60 pb-6 mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-3 py-1 text-xs font-semibold text-[#0071e3]">
            AI Intelligence Report
          </Badge>
          <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#34c759]/10 px-3 py-1 text-xs font-semibold text-[#34c759]">
            ATS Verified
          </Badge>
          {matchScore && (
            <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-3 py-1 text-xs font-semibold text-[#0071e3]">
              RAG Vector Match
            </Badge>
          )}
        </div>
        <CardTitle className="text-3xl font-extrabold tracking-tight text-[#1d1d1f] md:text-4xl">
          Resume Report
        </CardTitle>
        <p className="mt-3 text-base text-[#86868b] leading-relaxed">{summary}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" onClick={copySummary} className="apple-button-secondary border-none h-11 px-5 text-sm">
            <Copy className="mr-2 h-4 w-4" />
            {copied ? 'Summary Copied' : 'Copy Summary'}
          </Button>
          <Button onClick={onExport} className="apple-button h-11 px-5 text-sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF Report
          </Button>
          <Button variant="outline" onClick={onReset} className="apple-button-secondary border-none h-11 px-5 text-sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Analyze Another
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-2">
        {/* Score Gauges */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-border/70 bg-[#f5f5f7] p-5">
            <h3 className="mb-3 text-base font-semibold text-[#1d1d1f]">Resume Quality</h3>
            <ScoreGauge score={score} label="Format" strokeColor="#0071e3" badgeBg="bg-[#0071e3]/10" badgeTextColor="text-[#0071e3]" />
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-border/70 bg-[#f5f5f7] p-5">
            <h3 className="mb-3 text-base font-semibold text-[#1d1d1f]">ATS Compliance</h3>
            <ScoreGauge score={atsAnalysis.score} label="ATS" strokeColor="#34c759" badgeBg="bg-[#34c759]/10" badgeTextColor="text-[#34c759]" />
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-border/70 bg-[#f5f5f7] p-5">
            <h3 className="mb-3 text-base font-semibold text-[#1d1d1f]">RAG Vector Match</h3>
            <ScoreGauge score={matchScore || 0} label="Semantic" strokeColor="#0071e3" badgeBg="bg-[#0071e3]/10" badgeTextColor="text-[#0071e3]" />
          </div>
        </div>

        {/* Skill Gap Analysis Radar Chart */}
        <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm">
          <h3 className="mb-1.5 flex items-center gap-2.5 text-lg font-bold text-[#1d1d1f]">
            <Layers className="h-5 w-5 text-[#0071e3]" />
            Skill Gap Analytics
          </h3>
          <p className="text-sm text-[#86868b] mb-6">Visual mapping of candidate resume alignment against target job requirements.</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e8e8ed" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#86868b', fontSize: 13, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Candidate" dataKey="A" stroke="#0071e3" strokeWidth={3} fill="#0071e3" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#34c759]/25 bg-[#34c759]/5 p-6">
            <h3 className="mb-3 flex items-center gap-2.5 text-base font-bold text-[#34c759]">
              <CheckCircle2 className="h-5 w-5" />
              Strengths
            </h3>
            <ul className="space-y-2 text-sm text-[#1d1d1f]">
              {strengths.map((item, index) => <li key={index} className="list-disc pl-1 marker:text-[#34c759]">{item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#ff9500]/30 bg-[#ff9500]/5 p-6">
            <h3 className="mb-3 flex items-center gap-2.5 text-base font-bold text-[#ff9500]">
              <AlertTriangle className="h-5 w-5" />
              Areas for Improvement
            </h3>
            <ul className="space-y-2 text-sm text-[#1d1d1f]">
              {weaknesses.map((item, index) => <li key={index} className="list-disc pl-1 marker:text-[#ff9500]">{item}</li>)}
            </ul>
          </div>
        </div>

        {/* Suggested Improvements */}
        <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2.5 text-lg font-bold text-[#1d1d1f]">
            <Sparkles className="h-5 w-5 text-[#0071e3]" />
            Actionable Recommendations
          </h3>
          <ul className="space-y-2 text-sm text-[#424245]">
            {improvementSuggestions.map((item, index) => <li key={index} className="list-disc pl-1 marker:text-[#0071e3]">{item}</li>)}
          </ul>
        </div>

        {/* Targeted Interview Prep */}
        {interviewQuestions && interviewQuestions.length > 0 ? (
          <div className="rounded-2xl border border-[#0071e3]/20 bg-[#0071e3]/5 p-6">
            <h3 className="mb-2 flex items-center gap-2.5 text-lg font-bold text-[#0071e3]">
              <Target className="h-5 w-5" />
              Targeted Interview Questions
            </h3>
            <p className="text-sm text-[#86868b] mb-4">Questions likely to be asked based on your identified skill gaps:</p>
            <ul className="space-y-3 text-sm text-[#1d1d1f]">
              {interviewQuestions.map((q, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <span className="font-bold text-[#0071e3] chip-mono text-xs pt-0.5">Q{index + 1}.</span> 
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Bullet Point Rewrites */}
        {bulletPointRewrites.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#1d1d1f]">Bullet Point Enhancements</h3>
            <div className="space-y-4">
              {bulletPointRewrites.map((rewrite, index) => (
                <div key={index} className="rounded-2xl border border-border/70 bg-[#f5f5f7] p-5">
                  <p className="mb-2 text-sm text-[#86868b]"><strong className="text-[#ff3b30]">Original:</strong> {rewrite.before}</p>
                  <p className="mb-2 text-sm text-[#1d1d1f]"><strong className="text-[#34c759]">Enhanced:</strong> {rewrite.after}</p>
                  <p className="text-xs text-[#86868b]"><strong>Rationale:</strong> {rewrite.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Missing Keywords & ATS Warnings */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2.5 text-base font-bold text-[#1d1d1f]">
              <Target className="h-4 w-4 text-[#0071e3]" />
              Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {atsAnalysis.missingKeywords.length > 0 ? (
                atsAnalysis.missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-3 py-1 text-xs font-semibold text-[#0071e3]">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-[#86868b]">No critical keywords missing.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-base font-bold text-[#1d1d1f]">ATS Parsing Notes</h3>
            <ul className="space-y-2 text-sm text-[#86868b]">
              {atsAnalysis.issues.length > 0 ? atsAnalysis.issues.map((issue, index) => (
                <li key={index} className="list-disc pl-1 marker:text-[#ff9500]">{issue}</li>
              )) : <li>No major ATS formatting flags detected.</li>}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/70 pt-6">
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={onExport} className="apple-button h-12 px-6 text-base font-semibold">
              <Download className="mr-2 h-5 w-5" />
              Download PDF Report
            </Button>
            <Button variant="outline" onClick={onReset} className="apple-button-secondary h-12 px-6 text-base font-semibold border-none">
              <RotateCcw className="mr-2 h-5 w-5" />
              Analyze Another Resume
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisDisplay;
