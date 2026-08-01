import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, Download, RotateCcw, Sparkles, Target, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  score: number;
  label: string;
  colorClass: string;
}

const ScoreGauge = ({ score, label, colorClass }: ScoreGaugeProps) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-40 w-40">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-border/60"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className="text-primary"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-foreground">{score}</span>
        <span className="chip-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <span className={`chip-mono rounded-full px-3 py-1 text-xs ${colorClass}`}>Score / 100</span>
      </div>
    </div>
  );
};

export interface Analysis {
  score: number;
  matchScore?: number; // Added for Phase 5 (RAG Match)
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  interviewQuestions?: string[]; // Phase 3.2: Targeted interview questions
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

  // Mock data for Radar chart based on ATS/Match metrics
  const radarData = [
    { subject: 'Format', A: score, fullMark: 100 },
    { subject: 'Keywords', A: Math.max(100 - (atsAnalysis.missingKeywords.length * 10), 0), fullMark: 100 },
    { subject: 'Impact', A: score + 10 > 100 ? 100 : score + 10, fullMark: 100 },
    { subject: 'Relevance (RAG)', A: matchScore || Math.floor(score * 0.9), fullMark: 100 },
    { subject: 'ATS Parsing', A: atsAnalysis.score, fullMark: 100 },
  ];

  return (
    <Card className="brutalist-card w-full animate-fade-in overflow-hidden rounded-none p-2 md:p-6">
      <CardHeader className="bg-background border-b-4 border-black mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="chip-mono border-2 border-black bg-white text-black dark:bg-black dark:text-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">AI Report</Badge>
          <Badge variant="outline" className="chip-mono border-2 border-black bg-accent text-accent-foreground rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">ATS Optimized</Badge>
          {matchScore && <Badge variant="outline" className="chip-mono border-2 border-black bg-[#9333ea] text-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">RAG Analyzed</Badge>}
        </div>
        <CardTitle className="text-3xl font-display font-black uppercase md:text-5xl">Resume Intelligence Report</CardTitle>
        <p className="mt-2 text-muted-foreground">{summary}</p>

        <div className="mt-4 flex flex-wrap gap-4">
          <Button variant="outline" onClick={copySummary} className="brutalist-button rounded-none bg-white text-black dark:bg-black dark:text-white hover:bg-secondary">
            <Copy className="mr-2 h-4 w-4" />
            {copied ? 'Summary Copied' : 'Copy Summary'}
          </Button>
          <Button onClick={onExport} className="brutalist-button rounded-none bg-black text-white dark:bg-white dark:text-black">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={onReset} className="brutalist-button rounded-none bg-white text-black dark:bg-black dark:text-white hover:bg-secondary">
            <RotateCcw className="mr-2 h-4 w-4" />
            Analyze Another
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-12 pt-2">
        
        {/* PHASE 5: RAG Gauge + Existing Scores */}
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center border-4 border-black bg-white dark:bg-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="mb-4 text-xl font-black uppercase tracking-tighter">Resume Quality</h3>
            <ScoreGauge score={score} label="Format" colorClass="bg-black text-white dark:bg-white dark:text-black" />
          </div>
          <div className="flex flex-col items-center border-4 border-black bg-white dark:bg-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="mb-4 text-xl font-black uppercase tracking-tighter">ATS Score</h3>
            <ScoreGauge score={atsAnalysis.score} label="ATS" colorClass="bg-accent text-accent-foreground" />
          </div>
          <div className="flex flex-col items-center border-4 border-black bg-[#9333ea] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden">
            <h3 className="mb-4 text-xl font-black uppercase tracking-tighter text-white flex gap-2 items-center">
              RAG Match
            </h3>
            <ScoreGauge score={matchScore || 0} label="Semantic" colorClass="bg-white text-black" />
            <p className="text-xs font-bold text-white uppercase text-center mt-4">Cosine Similarity against JD</p>
          </div>
        </div>

        {/* PHASE 5: Gap Analysis Radar Chart */}
        <div className="border-4 border-black bg-white dark:bg-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="mb-2 flex items-center gap-3 text-2xl font-black uppercase">
            <Layers className="h-7 w-7 text-black dark:text-white" />
            Candidate Skill Gap Analysis
          </h3>
          <p className="text-sm font-bold uppercase text-muted-foreground mb-8">Visual representation of your resume's alignment with the Job Description requirements.</p>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="currentColor" className="text-black dark:text-white" strokeWidth={2} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 14, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Candidate" dataKey="A" stroke="hsl(var(--foreground))" strokeWidth={4} fill="hsl(var(--accent))" fillOpacity={1} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="border-4 border-black bg-[#22c55e] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="mb-4 flex items-center gap-3 text-2xl font-black uppercase text-black">
              <CheckCircle2 className="h-7 w-7" />
              Strengths
            </h3>
            <ul className="space-y-3 text-base font-medium text-black">
              {strengths.map((item, index) => <li key={index} className="list-disc pl-1 marker:text-black">{item}</li>)}
            </ul>
          </div>
          <div className="border-4 border-black bg-destructive p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="mb-4 flex items-center gap-3 text-2xl font-black uppercase text-white">
              <AlertTriangle className="h-7 w-7" />
              Areas for Improvement
            </h3>
            <ul className="space-y-3 text-base font-medium text-white">
              {weaknesses.map((item, index) => <li key={index} className="list-disc pl-1 marker:text-white">{item}</li>)}
            </ul>
          </div>
        </div>

        <div className="border-4 border-black bg-white dark:bg-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="mb-4 flex items-center gap-3 text-2xl font-black uppercase">
            <Sparkles className="h-7 w-7 text-black dark:text-white" />
            Suggested Improvements
          </h3>
          <ul className="space-y-3 text-base font-medium text-foreground">
            {improvementSuggestions.map((item, index) => <li key={index} className="list-disc pl-1 marker:text-accent">{item}</li>)}
          </ul>
        </div>

        {interviewQuestions && interviewQuestions.length > 0 ? (
          <div className="border-4 border-black bg-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="mb-4 flex items-center gap-3 text-2xl font-black uppercase text-white">
              <Target className="h-7 w-7 text-white" />
              Targeted Interview Prep
            </h3>
            <p className="text-sm font-bold uppercase text-white mb-6">Based on your skill gaps, expect these questions in an interview:</p>
            <ul className="space-y-4 text-base font-medium text-white">
              {interviewQuestions.map((q, index) => (
                <li key={index} className="flex gap-4 items-start">
                  <span className="font-black text-accent bg-black border-2 border-accent px-2 py-1 text-xs">Q{index + 1}.</span> 
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {bulletPointRewrites.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase">Bullet Point Upgrades</h3>
            <div className="space-y-6">
              {bulletPointRewrites.map((rewrite, index) => (
                <div key={index} className="border-4 border-black bg-white dark:bg-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                  <p className="mb-3 text-base text-foreground"><strong className="bg-destructive text-white px-1">BEFORE:</strong> {rewrite.before}</p>
                  <p className="mb-3 text-base text-foreground"><strong className="bg-[#22c55e] text-black px-1">AFTER:</strong> {rewrite.after}</p>
                  <p className="text-sm font-bold uppercase text-muted-foreground"><strong>WHY:</strong> {rewrite.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-8 md:grid-cols-2">
          <div className="border-4 border-black bg-white dark:bg-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="mb-4 flex items-center gap-3 text-2xl font-black uppercase">
              <Target className="h-7 w-7 text-accent" />
              Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-3">
              {atsAnalysis.missingKeywords.length > 0 ? (
                atsAnalysis.missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="chip-mono border-2 border-black bg-white text-black dark:bg-black dark:text-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-base font-medium text-foreground">No missing keywords detected.</p>
              )}
            </div>
          </div>

          <div className="border-4 border-black bg-white dark:bg-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="mb-4 text-2xl font-black uppercase">ATS Warnings</h3>
            <ul className="space-y-3 text-base font-medium text-foreground">
              {atsAnalysis.issues.length > 0 ? atsAnalysis.issues.map((issue, index) => (
                <li key={index} className="list-disc pl-1 marker:text-destructive">{issue}</li>
              )) : <li className="text-foreground">No major ATS issues flagged.</li>}
            </ul>
            {atsAnalysis.formatWarnings.length > 0 ? (
              <div className="mt-6 border-l-4 border-accent bg-secondary/30 p-4">
                <p className="chip-mono mb-3 text-sm font-bold uppercase text-foreground">Format Notes</p>
                <ul className="space-y-2 text-sm font-medium text-foreground">
                  {atsAnalysis.formatWarnings.map((warning, index) => (
                    <li key={index} className="list-disc pl-1 marker:text-accent">{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t-4 border-black pt-8">
             <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button onClick={onExport} className="brutalist-button h-14 rounded-none bg-black text-white dark:bg-white dark:text-black text-lg uppercase tracking-widest"><Download className="mr-2 h-5 w-5" />Export Improved Version</Button>
                <Button variant="outline" onClick={onReset} className="brutalist-button h-14 rounded-none bg-white text-black dark:bg-black dark:text-white text-lg uppercase tracking-widest"><RotateCcw className="mr-2 h-5 w-5" />Analyze Another</Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisDisplay;
