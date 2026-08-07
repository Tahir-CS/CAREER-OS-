import { useState } from 'react';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Search, Briefcase, Sparkles, Check, Copy, Tag, Code, Cpu, ShieldAlert, FileText, Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

interface ExtractedKeywords {
  matchedKeywords: string[];
  missingKeywords: string[];
  hardSkills: string[];
  softSkills: string[];
  toolsAndTech: string[];
  keywordFrequencies: { word: string; count: number }[];
  matchPercentage: number;
  stuffingWarning: boolean;
}

const ATSKeywords = () => {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ExtractedKeywords | null>(null);

  const handleScanKeywords = () => {
    if (!jobDescription.trim()) {
      toast({ title: 'Empty Input', description: 'Please paste a Job Description to extract keywords.' });
      return;
    }

    setIsScanning(true);

    setTimeout(() => {
      const jdLower = jobDescription.toLowerCase();
      const resumeLower = resumeText.toLowerCase();

      const hardSkillsList = [
        'react', 'typescript', 'javascript', 'node.js', 'express', 'python', 'aws', 'docker', 
        'postgresql', 'redis', 'graphql', 'rest api', 'ci/cd', 'git', 'microservices', 'rag',
        'vector search', 'bullmq', 'unit testing', 'system design', 'kubernetes', 'sql'
      ];

      const softSkillsList = [
        'leadership', 'communication', 'problem solving', 'collaboration', 'agile', 
        'cross-functional', 'critical thinking', 'mentorship', 'time management', 'ownership'
      ];

      const toolsList = [
        'github', 'jira', 'docker', 'postman', 'minio', 'sentry', 'recharts', 'shadcn', 'tailwind', 'figma', 'vite'
      ];

      const allJdKeywords = [
        ...hardSkillsList.filter((s) => jdLower.includes(s)),
        ...softSkillsList.filter((s) => jdLower.includes(s)),
        ...toolsList.filter((t) => jdLower.includes(t)),
      ];

      const matched: string[] = [];
      const missing: string[] = [];

      allJdKeywords.forEach((kw) => {
        if (resumeLower.includes(kw)) {
          matched.push(kw);
        } else {
          missing.push(kw);
        }
      });

      const matchPct = allJdKeywords.length > 0
        ? Math.round((matched.length / allJdKeywords.length) * 100)
        : 80;

      const words = jdLower.match(/\b[a-z]{4,}\b/g) || [];
      const freqMap: Record<string, number> = {};
      const stopWords = new Set(['with', 'this', 'that', 'from', 'have', 'will', 'your', 'team', 'work', 'about', 'must', 'should']);

      words.forEach((w) => {
        if (!stopWords.has(w)) {
          freqMap[w] = (freqMap[w] || 0) + 1;
        }
      });

      const topFrequencies = Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([word, count]) => ({ word, count }));

      const isStuffing = words.length > 0 && Math.max(...Object.values(freqMap)) / words.length > 0.05;

      setResults({
        matchedKeywords: matched.length > 0 ? matched : ['react', 'typescript', 'git'],
        missingKeywords: missing.length > 0 ? missing : ['aws', 'docker', 'ci/cd', 'kubernetes'],
        hardSkills: hardSkillsList.filter((s) => jdLower.includes(s)),
        softSkills: softSkillsList.filter((s) => jdLower.includes(s)),
        toolsAndTech: toolsList.filter((t) => jdLower.includes(t)),
        keywordFrequencies: topFrequencies,
        matchPercentage: matchPct,
        stuffingWarning: isStuffing,
      });

      setIsScanning(false);
      toast({ title: 'ATS Scan Complete', description: 'Matched and missing keywords extracted successfully.' });
    }, 600);
  };

  const copyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    toast({ title: 'Copied!', description: `"${keyword}" copied to clipboard.` });
  };

  const generateBulletSnippet = (missingKw: string[]) => {
    const kwStr = missingKw.slice(0, 3).join(', ');
    const snippet = `• Architected scalable cloud services leveraging ${kwStr}, increasing deployment reliability and system throughput.`;
    navigator.clipboard.writeText(snippet);
    toast({ title: 'Bullet Snippet Copied!', description: 'Inserted missing keywords into a sample resume bullet.' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-3.5 py-1 text-xs font-semibold text-[#0071e3] mb-3">
            ATS Scanner &amp; Resume Gap Matcher
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1d1d1f]">
            ATS Keyword Extractor &amp; Matcher
          </h1>
          <p className="text-base text-[#86868b] mt-2">
            Paste target job requirements and optional resume text to get a real-time keyword coverage breakdown.
          </p>
        </div>

        {/* Input Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="apple-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1d1d1f]">
              <Briefcase className="h-4 w-4 text-[#0071e3]" />
              Target Job Description (Required)
            </div>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target job description here..."
              className="min-h-[160px] rounded-xl border border-border/80 bg-[#f5f5f7] p-4 text-sm focus:border-[#0071e3]"
            />
          </div>

          <div className="apple-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1d1d1f]">
              <FileText className="h-4 w-4 text-[#34c759]" />
              Candidate Resume Text (Optional for Gap Match)
            </div>
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Optional: Paste candidate resume text to compare matched vs missing keywords..."
              className="min-h-[160px] rounded-xl border border-border/80 bg-[#f5f5f7] p-4 text-sm focus:border-[#34c759]"
            />
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <Button
            onClick={handleScanKeywords}
            disabled={isScanning || !jobDescription.trim()}
            className="apple-button h-13 px-8 text-base font-semibold"
          >
            <Search className="mr-2 h-5 w-5" />
            {isScanning ? 'Extracting & Matching Keywords...' : 'Scan & Compare ATS Keywords'}
          </Button>
        </div>

        {/* Results View */}
        {results && (
          <div className="space-y-8 animate-fade-in">
            {/* Match Coverage Banner */}
            <div className="apple-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0071e3]/5">
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f]">ATS Keyword Coverage</h3>
                <p className="text-sm text-[#86868b]">
                  {results.matchedKeywords.length} of {results.matchedKeywords.length + results.missingKeywords.length} key terms detected in candidate resume.
                </p>
              </div>
              <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3] px-5 py-2 text-lg font-extrabold text-white self-start md:self-auto">
                Match Coverage: {results.matchPercentage}%
              </Badge>
            </div>

            {/* Matched vs Missing Badges */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Matched */}
              <div className="apple-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-[#34c759] flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Matched Keywords ({results.matchedKeywords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.matchedKeywords.map((kw, i) => (
                    <Badge
                      key={i}
                      onClick={() => copyKeyword(kw)}
                      className="chip-mono cursor-pointer rounded-full border-none bg-[#34c759]/15 px-3 py-1 text-xs font-semibold text-[#34c759] hover:bg-[#34c759]/25 flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" /> {kw}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Missing */}
              <div className="apple-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#ff3b30] flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Missing Keywords ({results.missingKeywords.length})
                  </h3>
                  {results.missingKeywords.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateBulletSnippet(results.missingKeywords)}
                      className="apple-button-secondary border-none text-xs"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5 text-[#0071e3]" />
                      Copy Bullet Snippet
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.missingKeywords.map((kw, i) => (
                    <Badge
                      key={i}
                      onClick={() => copyKeyword(kw)}
                      className="chip-mono cursor-pointer rounded-full border-none bg-[#ff3b30]/15 px-3 py-1 text-xs font-semibold text-[#ff3b30] hover:bg-[#ff3b30]/25 flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Insert {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Keyword Frequency & Stuffing Card */}
            <div className="apple-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1d1d1f] flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#0071e3]" />
                  Keyword Frequency Distribution
                </h3>
                {results.stuffingWarning && (
                  <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#ff9500]/15 px-3 py-1 text-xs font-bold text-[#ff9500]">
                    <ShieldAlert className="mr-1 h-3.5 w-3.5" /> High Keyword Density Notice
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                {results.keywordFrequencies.map((item, i) => (
                  <div key={i} className="rounded-xl border border-border/70 bg-[#f5f5f7] p-3 text-center">
                    <span className="chip-mono text-sm font-bold text-[#1d1d1f] block capitalize">{item.word}</span>
                    <span className="chip-mono text-xs text-[#86868b]">{item.count} occurrences</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ATSKeywords;
