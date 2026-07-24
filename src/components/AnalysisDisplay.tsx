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
  const { score, matchScore, summary, strengths, weaknesses, improvementSuggestions, bulletPointRewrites, atsAnalysis } = analysis;

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
    <Card className="glass-card w-full animate-fade-in overflow-hidden border border-border/70 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="chip-mono border-primary/30 bg-primary/10 text-primary">AI Report</Badge>
          <Badge variant="outline" className="chip-mono border-accent/30 bg-accent/10 text-accent">ATS Optimized</Badge>
          {matchScore && <Badge variant="outline" className="chip-mono border-purple-500/30 bg-purple-500/10 text-purple-600">RAG Analyzed</Badge>}
        </div>
        <CardTitle className="text-2xl font-display md:text-3xl">Resume Intelligence Report</CardTitle>
        <p className="mt-2 text-muted-foreground">{summary}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" onClick={copySummary} className="border-primary/40 bg-primary/5 text-primary hover:bg-primary/10">
            <Copy className="mr-2 h-4 w-4" />
            {copied ? 'Summary Copied' : 'Copy Summary'}
          </Button>
          <Button onClick={onExport} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Analyze Another
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-9 pt-6">
        
        {/* PHASE 5: RAG Gauge + Existing Scores */}
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-border/60 bg-background/60 p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Resume Quality</h3>
            <ScoreGauge score={score} label="Format" colorClass="bg-primary/12 text-primary" />
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-border/60 bg-background/60 p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">ATS Score</h3>
            <ScoreGauge score={atsAnalysis.score} label="ATS" colorClass="bg-accent/12 text-accent" />
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-border/60 bg-background/60 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
               <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
            </div>
            <h3 className="mb-4 text-lg font-semibold flex gap-2 items-center">
              RAG Match
            </h3>
            <ScoreGauge score={matchScore || 0} label="Semantic" colorClass="bg-purple-500/12 text-purple-600" />
            <p className="text-xs text-muted-foreground text-center mt-4">Cosine Similarity against Job Description</p>
          </div>
        </div>

        {/* PHASE 5: Gap Analysis Radar Chart */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Layers className="h-5 w-5 text-primary" />
            Candidate Skill Gap Analysis
          </h3>
          <p className="text-sm text-muted-foreground mb-6">Visual representation of your resume's alignment with the Job Description requirements.</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="currentColor" className="text-border/40" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12 }} className="text-muted-foreground" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Candidate" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/65 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              Strengths
            </h3>
            <ul className="space-y-2 text-sm text-emerald-900">
              {strengths.map((item, index) => <li key={index} className="list-disc pl-1 marker:text-emerald-600">{item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Areas for Improvement
            </h3>
            <ul className="space-y-2 text-sm text-amber-900">
              {weaknesses.map((item, index) => <li key={index} className="list-disc pl-1 marker:text-amber-600">{item}</li>)}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/70 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            Suggested Improvements
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {improvementSuggestions.map((item, index) => <li key={index} className="list-disc pl-1 marker:text-primary">{item}</li>)}
          </ul>
        </div>

        {bulletPointRewrites.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bullet Point Upgrades</h3>
            <div className="space-y-4">
              {bulletPointRewrites.map((rewrite, index) => (
                <div key={index} className="rounded-2xl border border-border/70 bg-secondary/45 p-4">
                  <p className="mb-2 text-sm text-muted-foreground"><strong>Before:</strong> {rewrite.before}</p>
                  <p className="mb-2 text-sm text-primary"><strong>After:</strong> {rewrite.after}</p>
                  <p className="text-xs text-muted-foreground"><strong>Why:</strong> {rewrite.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Target className="h-5 w-5 text-accent" />
              Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {atsAnalysis.missingKeywords.length > 0 ? (
                atsAnalysis.missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="border-accent/35 bg-accent/10 text-accent">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No missing keywords detected for this analysis.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-5">
            <h3 className="mb-3 text-lg font-semibold">ATS Warnings</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {atsAnalysis.issues.length > 0 ? atsAnalysis.issues.map((issue, index) => (
                <li key={index} className="list-disc pl-1 marker:text-accent">{issue}</li>
              )) : <li className="text-muted-foreground">No major ATS issues were flagged.</li>}
            </ul>
            {atsAnalysis.formatWarnings.length > 0 ? (
              <div className="mt-4 rounded-xl bg-background/80 p-3">
                <p className="chip-mono mb-2 text-xs uppercase text-muted-foreground">Format Notes</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {atsAnalysis.formatWarnings.map((warning, index) => (
                    <li key={index} className="list-disc pl-1 marker:text-primary">{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-border/70 pt-5">
             <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button onClick={onExport}><Download className="mr-2 h-4 w-4" />Export Improved Version</Button>
                <Button variant="outline" onClick={onReset}><RotateCcw className="mr-2 h-4 w-4" />Analyze Another</Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisDisplay;
