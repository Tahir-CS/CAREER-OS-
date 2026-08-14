import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Trash2, Columns, ArrowLeft, ArrowRight } from 'lucide-react';
import AnalysisDisplay, { Analysis } from '../components/AnalysisDisplay';
import { useToast } from '../components/ui/use-toast';

export interface SavedReport {
  id: string;
  filename: string;
  timestamp: string;
  jobDescription?: string;
  analysis: Analysis;
}

export const getSavedHistory = (): SavedReport[] => {
  try {
    const data = localStorage.getItem('careeros_analysis_history');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to read history:', error);
    return [];
  }
};

export const saveReportToHistory = (filename: string, analysis: Analysis, jobDescription?: string) => {
  try {
    const history = getSavedHistory();
    const newReport: SavedReport = {
      id: crypto.randomUUID(),
      filename,
      timestamp: new Date().toISOString(),
      jobDescription,
      analysis,
    };
    localStorage.setItem('careeros_analysis_history', JSON.stringify([newReport, ...history].slice(0, 30)));
  } catch (error) {
    console.error('Failed to save report to history:', error);
  }
};

const History = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => setHistory(getSavedHistory()), []);

  const clearHistory = () => {
    localStorage.removeItem('careeros_analysis_history');
    setHistory([]);
    setSelectedReport(null);
    setCompareIds([]);
    toast({ title: 'History cleared', description: 'Saved local analysis reports were removed.' });
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const query = searchQuery.toLowerCase();
    return history.filter((item) =>
      item.filename.toLowerCase().includes(query) ||
      item.jobDescription?.toLowerCase().includes(query) ||
      item.analysis.summary.toLowerCase().includes(query)
    );
  }, [history, searchQuery]);

  const avgScore = history.length
    ? Math.round(history.reduce((sum, item) => sum + item.analysis.score, 0) / history.length)
    : 0;
  const maxScore = history.length ? Math.max(...history.map((item) => item.analysis.score)) : 0;

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((item) => item !== id));
    } else if (compareIds.length >= 2) {
      setCompareIds([compareIds[1], id]);
    } else {
      setCompareIds([...compareIds, id]);
    }
  };

  const reportA = history.find((report) => report.id === compareIds[0]);
  const reportB = history.find((report) => report.id === compareIds[1]);

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-[#f3f0e7] text-[#17201d]">
        <Header />
        <main className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
          <button onClick={() => setSelectedReport(null)} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#173f35]">
            <ArrowLeft className="h-4 w-4" /> Back to revision history
          </button>
          <AnalysisDisplay
            analysis={selectedReport.analysis}
            onReset={() => setSelectedReport(null)}
            onExport={() => toast({ title: 'Export', description: 'Open the original report from the workspace to export the generated PDF.' })}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f0e7] text-[#17201d]">
      <Header />
      <main className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <div className="grid gap-8 border-b border-[#d2cabb] py-9 md:grid-cols-[1fr_auto] md:items-end md:py-12">
          <div>
            <p className="rule-label">History / 04</p>
            <h1 className="display-serif mt-4 text-4xl leading-[1] md:text-6xl">Revision history</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#59615c]">
              Keep each run as a checkpoint. Compare scores and open the report that explains why the number moved.
            </p>
          </div>
          {history.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="apple-button-secondary h-9 px-3 text-xs"
                onClick={() => {
                  setCompareMode(!compareMode);
                  setCompareIds([]);
                }}
              >
                <Columns className="mr-1.5 h-3.5 w-3.5" /> {compareMode ? 'Exit compare' : 'Compare two'}
              </Button>
              <Button variant="outline" className="h-9 border-[#d9aa9a] bg-[#f7e6df] px-3 text-xs text-[#a4432c] hover:bg-[#f2d9cf]" onClick={clearHistory}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <section className="mt-8 grid min-h-[360px] place-items-center border border-[#cfc7b7] bg-[#faf8f2] p-8 text-center">
            <div className="max-w-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#b84f31]">No checkpoints yet</p>
              <h2 className="display-serif mt-3 text-3xl">Your first analysis becomes revision #01.</h2>
              <p className="mt-3 text-sm leading-6 text-[#59615c]">Run a resume through the workspace, make an edit, then come back here to compare the next version.</p>
              <Button onClick={() => navigate('/app')} className="apple-button mt-5 h-10 px-5 text-sm">Open workspace</Button>
            </div>
          </section>
        ) : (
          <>
            <section className="grid border-x border-b border-[#cfc7b7] bg-[#faf8f2] sm:grid-cols-3">
              {[
                ['Saved runs', history.length.toString(), 'local checkpoints'],
                ['Average', `${avgScore}`, 'overall score'],
                ['Best', `${maxScore}`, 'highest score'],
              ].map(([label, value, note]) => (
                <div key={label} className="border-b border-[#d2cabb] p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#85877f]">{label}</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-[#173f35]">{value}</p>
                  <p className="mt-1 text-xs text-[#72776f]">{note}</p>
                </div>
              ))}
            </section>

            {compareMode && (
              <section className="mt-8 border border-[#cfc7b7] bg-[#e9e4d8] p-5 md:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">Compare mode</p>
                    <h2 className="mt-2 text-lg font-semibold">Select two checkpoints below.</h2>
                  </div>
                  <p className="font-mono text-[10px] text-[#85877f]">{compareIds.length}/2 selected</p>
                </div>
                {reportA && reportB && (
                  <div className="mt-5 grid bg-[#faf8f2] md:grid-cols-2">
                    {[reportA, reportB].map((report, index) => (
                      <div key={report.id} className="border border-[#d2cabb] p-5 md:first:border-r-0">
                        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#b84f31]">Checkpoint {index === 0 ? 'A' : 'B'}</p>
                        <p className="mt-2 truncate text-sm font-semibold">{report.filename}</p>
                        <p className="mt-1 text-xs text-[#72776f]">{new Date(report.timestamp).toLocaleDateString()}</p>
                        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#d2cabb] pt-4">
                          <div><p className="font-mono text-xl">{report.analysis.score}</p><p className="text-[10px] text-[#85877f]">overall</p></div>
                          <div><p className="font-mono text-xl">{report.analysis.atsAnalysis?.score ?? 0}</p><p className="text-[10px] text-[#85877f]">ATS</p></div>
                          <div><p className="font-mono text-xl">{report.analysis.matchScore ?? 0}</p><p className="text-[10px] text-[#85877f]">match</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="mt-8">
              <div className="flex flex-col gap-3 border-b border-[#d2cabb] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[#85877f]" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search file name or report text…"
                    className="h-10 rounded-none border-[#cfc7b7] bg-[#faf8f2] pl-9 text-sm focus-visible:ring-1 focus-visible:ring-[#173f35]"
                  />
                </div>
                <p className="font-mono text-[10px] text-[#85877f]">{filteredHistory.length} of {history.length} runs</p>
              </div>

              <div>
                {filteredHistory.map((item, index) => {
                  const selected = compareIds.includes(item.id);
                  return (
                    <article key={item.id} className={`grid gap-4 border-b border-[#d2cabb] py-5 md:grid-cols-[60px_1fr_210px_auto] md:items-center ${selected ? 'bg-[#e6eee9]' : ''}`}>
                      <div className="flex items-center gap-3">
                        {compareMode && <input type="checkbox" checked={selected} onChange={() => toggleCompare(item.id)} className="h-4 w-4 accent-[#173f35]" />}
                        <span className="font-mono text-xs text-[#b84f31]">{String(filteredHistory.length - index).padStart(2, '0')}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{item.filename}</h3>
                        <p className="mt-1 text-xs text-[#72776f]">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center md:text-left">
                        <div><p className="font-mono text-lg">{item.analysis.score}</p><p className="text-[10px] text-[#85877f]">overall</p></div>
                        <div><p className="font-mono text-lg">{item.analysis.atsAnalysis?.score ?? 0}</p><p className="text-[10px] text-[#85877f]">ATS</p></div>
                        <div><p className="font-mono text-lg">{item.analysis.matchScore ?? 0}</p><p className="text-[10px] text-[#85877f]">match</p></div>
                      </div>
                      <button onClick={() => setSelectedReport(item)} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#173f35]">
                        Open report <ArrowRight className="h-4 w-4" />
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default History;
