import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { History as HistoryIcon, FileText, Download, ArrowUpRight, Trash2, Sparkles, TrendingUp, Search, Columns, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import AnalysisDisplay, { Analysis } from '../components/AnalysisDisplay';
import { useToast } from '../components/ui/use-toast';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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
    const updated = [newReport, ...history];
    localStorage.setItem('careeros_analysis_history', JSON.stringify(updated.slice(0, 30)));
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

  useEffect(() => {
    setHistory(getSavedHistory());
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('careeros_analysis_history');
    setHistory([]);
    setSelectedReport(null);
    setCompareIds([]);
    toast({ title: 'History Cleared', description: 'All stored analysis reports have been removed.' });
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.filename.toLowerCase().includes(q) ||
        (item.jobDescription && item.jobDescription.toLowerCase().includes(q)) ||
        item.analysis.summary.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const chartData = useMemo(() => {
    return [...history]
      .reverse()
      .map((item, index) => ({
        index: `Run #${index + 1}`,
        date: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Score: item.analysis.score,
        ATS: item.analysis.atsAnalysis.score,
        RAG: item.analysis.matchScore || Math.round(item.analysis.score * 0.9),
      }));
  }, [history]);

  const avgScore = history.length > 0
    ? Math.round(history.reduce((acc, item) => acc + item.analysis.score, 0) / history.length)
    : 0;

  const maxScore = history.length > 0
    ? Math.max(...history.map((item) => item.analysis.score))
    : 0;

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((item) => item !== id));
    } else {
      if (compareIds.length >= 2) {
        setCompareIds([compareIds[1], id]);
      } else {
        setCompareIds([...compareIds, id]);
      }
    }
  };

  const reportA = history.find((r) => r.id === compareIds[0]);
  const reportB = history.find((r) => r.id === compareIds[1]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {selectedReport ? (
          <div>
            <Button
              variant="outline"
              className="apple-button-secondary mb-6 border-none"
              onClick={() => setSelectedReport(null)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to History Dashboard
            </Button>

            <AnalysisDisplay
              analysis={selectedReport.analysis}
              onReset={() => setSelectedReport(null)}
              onExport={() => {
                toast({ title: 'Export PDF', description: 'Generating report PDF...' });
              }}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1d1d1f]">
                  Career Trajectory &amp; History
                </h1>
                <p className="text-base text-[#86868b] mt-1">
                  Comprehensive score progression timeline, side-by-side report comparison, and report archives.
                </p>
              </div>

              {history.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCompareMode(!compareMode);
                      setCompareIds([]);
                    }}
                    className={`apple-button-secondary border-none text-xs font-semibold ${
                      compareMode ? 'bg-[#0071e3] text-white' : ''
                    }`}
                  >
                    <Columns className="mr-1.5 h-4 w-4" />
                    {compareMode ? 'Exit Compare Mode' : 'Compare 2 Reports'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={clearHistory}
                    className="apple-button-secondary border-none text-xs text-[#ff3b30] hover:bg-[#ff3b30]/10"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Clear History
                  </Button>
                </div>
              )}
            </div>

            {/* Score Trajectory Line Chart Card */}
            {history.length > 1 && (
              <div className="apple-card p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#1d1d1f] flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#0071e3]" />
                      Resume Score Trajectory Over Time
                    </h3>
                    <p className="text-xs text-[#86868b]">Visualizing score improvement across all revision runs.</p>
                  </div>
                  <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#34c759]/10 px-3 py-1 text-xs font-bold text-[#34c759]">
                    Peak Score: {maxScore}/100
                  </Badge>
                </div>

                <div className="h-[240px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                      <XAxis dataKey="date" tick={{ fill: '#86868b', fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#86868b', fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="Score" stroke="#0071e3" strokeWidth={3} fillOpacity={1} fill="url(#scoreGrad)" />
                      <Area type="monotone" dataKey="ATS" stroke="#34c759" strokeWidth={2} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Side-by-Side Comparison View */}
            {compareMode && (
              <div className="apple-card p-6 md:p-8 space-y-6 bg-[#0071e3]/5 border-[#0071e3]/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#1d1d1f] flex items-center gap-2">
                    <Columns className="h-5 w-5 text-[#0071e3]" />
                    Side-by-Side Report Comparison Matrix
                  </h3>
                  <p className="text-xs font-bold text-[#0071e3] chip-mono">
                    Select 2 reports below to compare ({compareIds.length}/2 selected)
                  </p>
                </div>

                {reportA && reportB ? (
                  <div className="grid gap-6 md:grid-cols-2 pt-2">
                    {/* Report A */}
                    <div className="rounded-2xl border border-border/80 bg-white p-5 space-y-3">
                      <Badge className="bg-[#0071e3] text-white">Report A (Older)</Badge>
                      <h4 className="font-bold text-[#1d1d1f]">{reportA.filename}</h4>
                      <p className="text-xs text-[#86868b]">{new Date(reportA.timestamp).toLocaleDateString()}</p>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="rounded-xl bg-[#f5f5f7] p-3 text-center">
                          <span className="text-2xl font-extrabold text-[#0071e3]">{reportA.analysis.score}</span>
                          <span className="text-[10px] uppercase font-bold text-[#86868b] block">Quality Score</span>
                        </div>
                        <div className="rounded-xl bg-[#f5f5f7] p-3 text-center">
                          <span className="text-2xl font-extrabold text-[#34c759]">{reportA.analysis.atsAnalysis.score}</span>
                          <span className="text-[10px] uppercase font-bold text-[#86868b] block">ATS Compliance</span>
                        </div>
                      </div>
                    </div>

                    {/* Report B */}
                    <div className="rounded-2xl border border-border/80 bg-white p-5 space-y-3">
                      <Badge className="bg-[#34c759] text-white">Report B (Newer)</Badge>
                      <h4 className="font-bold text-[#1d1d1f]">{reportB.filename}</h4>
                      <p className="text-xs text-[#86868b]">{new Date(reportB.timestamp).toLocaleDateString()}</p>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="rounded-xl bg-[#f5f5f7] p-3 text-center">
                          <span className="text-2xl font-extrabold text-[#0071e3]">{reportB.analysis.score}</span>
                          <span className="text-[10px] uppercase font-bold text-[#86868b] block">Quality Score</span>
                        </div>
                        <div className="rounded-xl bg-[#f5f5f7] p-3 text-center">
                          <span className="text-2xl font-extrabold text-[#34c759]">{reportB.analysis.atsAnalysis.score}</span>
                          <span className="text-[10px] uppercase font-bold text-[#86868b] block">ATS Compliance</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#86868b]">Click check-boxes on any 2 report cards below to render comparison metrics.</p>
                )}
              </div>
            )}

            {/* Search & Filter Bar */}
            {history.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reports by file name, role, or keywords..."
                    className="pl-10 rounded-xl border border-border/80 bg-white h-11 text-sm focus:border-[#0071e3]"
                  />
                </div>

                <span className="chip-mono text-xs font-semibold text-[#86868b] self-end sm:self-auto">
                  Showing {filteredHistory.length} of {history.length} saved reports
                </span>
              </div>
            )}

            {/* Reports List */}
            {history.length === 0 ? (
              <div className="apple-card p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#1d1d1f]">No History Reports Yet</h3>
                <p className="text-base text-[#86868b] max-w-md">
                  Upload a resume on the main dashboard to generate your first AI evaluation report.
                </p>
                <Button onClick={() => navigate('/')} className="apple-button mt-4 h-12 px-6">
                  Analyze Resume Now
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredHistory.map((item) => {
                  const isCheckedForCompare = compareIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`apple-card apple-card-hover p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        isCheckedForCompare ? 'ring-2 ring-[#0071e3] bg-[#0071e3]/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {compareMode && (
                          <input
                            type="checkbox"
                            checked={isCheckedForCompare}
                            onChange={() => toggleCompare(item.id)}
                            className="mt-1.5 h-5 w-5 rounded border-gray-300 text-[#0071e3] focus:ring-[#0071e3]"
                          />
                        )}

                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-base font-bold text-[#1d1d1f]">{item.filename}</h4>
                          <p className="chip-mono text-xs text-[#86868b] mt-0.5">
                            {new Date(item.timestamp).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {item.jobDescription && (
                            <p className="truncate text-xs text-[#86868b] mt-1 max-w-md">
                              Target Role: {item.jobDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto">
                        <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-3 py-1 text-xs font-bold text-[#0071e3]">
                          Quality: {item.analysis.score}
                        </Badge>
                        <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#34c759]/10 px-3 py-1 text-xs font-semibold text-[#34c759]">
                          ATS: {item.analysis.atsAnalysis.score}
                        </Badge>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedReport(item)}
                          className="apple-button-secondary border-none h-9 px-4 text-xs"
                        >
                          View Report <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
