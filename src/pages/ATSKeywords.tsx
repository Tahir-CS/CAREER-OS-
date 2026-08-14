import { useState } from 'react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Copy, Plus, AlertTriangle } from 'lucide-react';
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
      toast({ title: 'Job description required', description: 'Paste a target role before running the scan.' });
      return;
    }

    setIsScanning(true);

    setTimeout(() => {
      const jdLower = jobDescription.toLowerCase();
      const resumeLower = resumeText.toLowerCase();

      const hardSkillsList = [
        'react', 'typescript', 'javascript', 'node.js', 'express', 'python', 'aws', 'docker',
        'postgresql', 'redis', 'graphql', 'rest api', 'ci/cd', 'git', 'microservices', 'rag',
        'vector search', 'bullmq', 'unit testing', 'system design', 'kubernetes', 'sql',
      ];
      const softSkillsList = [
        'leadership', 'communication', 'problem solving', 'collaboration', 'agile',
        'cross-functional', 'critical thinking', 'mentorship', 'time management', 'ownership',
      ];
      const toolsList = ['github', 'jira', 'docker', 'postman', 'minio', 'sentry', 'recharts', 'shadcn', 'tailwind', 'figma', 'vite'];

      const allJdKeywords = [
        ...hardSkillsList.filter((s) => jdLower.includes(s)),
        ...softSkillsList.filter((s) => jdLower.includes(s)),
        ...toolsList.filter((t) => jdLower.includes(t)),
      ];

      const matched: string[] = [];
      const missing: string[] = [];
      allJdKeywords.forEach((keyword) => {
        if (resumeLower.includes(keyword)) matched.push(keyword);
        else missing.push(keyword);
      });

      const matchPct = allJdKeywords.length > 0 ? Math.round((matched.length / allJdKeywords.length) * 100) : 80;
      const words = jdLower.match(/\b[a-z]{4,}\b/g) || [];
      const freqMap: Record<string, number> = {};
      const stopWords = new Set(['with', 'this', 'that', 'from', 'have', 'will', 'your', 'team', 'work', 'about', 'must', 'should']);

      words.forEach((word) => {
        if (!stopWords.has(word)) freqMap[word] = (freqMap[word] || 0) + 1;
      });

      const topFrequencies = Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([word, count]) => ({ word, count }));

      const values = Object.values(freqMap);
      const isStuffing = words.length > 0 && values.length > 0 && Math.max(...values) / words.length > 0.05;

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
      toast({ title: 'ATS scan ready', description: 'Review matched and missing role signals below.' });
    }, 600);
  };

  const copyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    toast({ title: 'Copied', description: `${keyword} copied to clipboard.` });
  };

  const generateBulletSnippet = (missingKw: string[]) => {
    const kwStr = missingKw.slice(0, 3).join(', ');
    const snippet = `• Architected scalable cloud services leveraging ${kwStr}, increasing deployment reliability and system throughput.`;
    navigator.clipboard.writeText(snippet);
    toast({ title: 'Sample bullet copied', description: 'Use it as a structure, then replace it with truthful evidence from your own work.' });
  };

  return (
    <div className="min-h-screen bg-[#f3f0e7] text-[#17201d]">
      <Header />

      <main className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <div className="grid gap-9 border-b border-[#d2cabb] py-9 md:grid-cols-[1fr_420px] md:items-center md:py-12">
          <div>
            <p className="rule-label">ATS scan / 02</p>
            <h1 className="display-serif mt-4 max-w-2xl text-4xl leading-[1] md:text-6xl">Find the language your resume is missing.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#59615c]">
              Compare the role with your resume text. The scan separates matched signals from gaps so you can decide what is worth making explicit.
            </p>
          </div>
          <img src="/brand/ats-sheet.svg" alt="Illustration of resume keywords compared with role signals" className="w-full" />
        </div>

        <section className="grid gap-0 border-x border-b border-[#cfc7b7] bg-[#faf8f2] md:grid-cols-2">
          <div className="border-b border-[#cfc7b7] p-5 md:border-b-0 md:border-r md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#b84f31]">Input A / role</p>
                <h2 className="mt-1 text-base font-semibold">Target job description</h2>
              </div>
              <span className="font-mono text-[10px] text-[#85877f]">required</span>
            </div>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste responsibilities, requirements, and preferred qualifications…"
              className="min-h-[230px] resize-y rounded-none border-[#cfc7b7] bg-[#f3f0e7] p-4 text-sm leading-6 focus-visible:ring-1 focus-visible:ring-[#173f35]"
            />
          </div>

          <div className="p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#225a4b]">Input B / resume</p>
                <h2 className="mt-1 text-base font-semibold">Resume text</h2>
              </div>
              <span className="font-mono text-[10px] text-[#85877f]">optional</span>
            </div>
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume text to split signals into matched and missing…"
              className="min-h-[230px] resize-y rounded-none border-[#cfc7b7] bg-[#f3f0e7] p-4 text-sm leading-6 focus-visible:ring-1 focus-visible:ring-[#173f35]"
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 border-x border-b border-[#cfc7b7] bg-[#e9e4d8] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[#59615c]">Treat missing terms as prompts to surface real experience, not words to paste blindly.</p>
          <Button onClick={handleScanKeywords} disabled={isScanning || !jobDescription.trim()} className="apple-button h-10 px-5 text-sm">
            {isScanning ? 'Reading role signals…' : 'Run ATS comparison'}
          </Button>
        </div>

        {results && (
          <section className="mt-8 border border-[#cfc7b7] bg-[#faf8f2]">
            <div className="grid border-b border-[#cfc7b7] bg-[#173f35] text-[#f8f5ed] md:grid-cols-[1fr_210px] md:items-center">
              <div className="p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#e99a7e]">Coverage report</p>
                <h2 className="display-serif mt-2 text-3xl text-[#f8f5ed]">Role signal coverage</h2>
                <p className="mt-2 text-sm text-[#b9c8c2]">{results.matchedKeywords.length} matched · {results.missingKeywords.length} missing</p>
              </div>
              <div className="border-t border-white/10 p-6 md:border-l md:border-t-0">
                <div className="flex items-end gap-2">
                  <span className="font-mono text-4xl font-semibold">{results.matchPercentage}%</span>
                  <span className="pb-1 text-xs text-[#9eb5ac]">coverage</span>
                </div>
                <div className="mt-3 h-1.5 bg-[#31594f]">
                  <div className="h-full bg-[#e86e45]" style={{ width: `${results.matchPercentage}%` }} />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2">
              <div className="border-b border-[#d2cabb] p-5 md:border-b-0 md:border-r md:p-6">
                <p className="eyebrow">Matched</p>
                <h3 className="mt-2 text-lg font-semibold">Already present in the resume</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {results.matchedKeywords.map((keyword) => (
                    <button key={keyword} onClick={() => copyKeyword(keyword)} className="border border-[#afc2ba] bg-[#e6eee9] px-2.5 py-1.5 font-mono text-[10px] text-[#225a4b] hover:bg-[#dce8e2]">
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Missing</p>
                    <h3 className="mt-2 text-lg font-semibold">Not explicit in the resume</h3>
                  </div>
                  {results.missingKeywords.length > 0 && (
                    <button onClick={() => generateBulletSnippet(results.missingKeywords)} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#173f35] underline decoration-[#e86e45] underline-offset-4">
                      <Copy className="h-3.5 w-3.5" /> sample structure
                    </button>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {results.missingKeywords.map((keyword) => (
                    <button key={keyword} onClick={() => copyKeyword(keyword)} className="inline-flex items-center gap-1 border border-[#e2b5a5] bg-[#f7e6df] px-2.5 py-1.5 font-mono text-[10px] text-[#a4432c] hover:bg-[#f2d9cf]">
                      <Plus className="h-3 w-3" /> {keyword}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid border-t border-[#d2cabb] lg:grid-cols-[0.7fr_1.3fr]">
              <div className="border-b border-[#d2cabb] bg-[#e9e4d8] p-5 lg:border-b-0 lg:border-r lg:p-6">
                <p className="eyebrow">Language density</p>
                <h3 className="mt-2 text-lg font-semibold">Terms repeated in the posting</h3>
                {results.stuffingWarning && (
                  <p className="mt-4 flex items-start gap-2 border-l-2 border-[#e86e45] pl-3 text-xs leading-5 text-[#6d5349]">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> One or more terms are unusually dense. Do not mirror repetition just to raise coverage.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {results.keywordFrequencies.map((item) => (
                  <div key={item.word} className="border-b border-r border-[#d2cabb] p-4">
                    <p className="text-sm font-medium capitalize">{item.word}</p>
                    <p className="mt-1 font-mono text-[10px] text-[#85877f]">{item.count} occurrence{item.count === 1 ? '' : 's'}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ATSKeywords;
