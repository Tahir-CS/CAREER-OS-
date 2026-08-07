import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { History as HistoryIcon, FileText, Download, ArrowUpRight, Trash2, Sparkles, TrendingUp } from 'lucide-react';
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
    const updated = [newReport, ...history];
    localStorage.setItem('careeros_analysis_history', JSON.stringify(updated.slice(0, 20))); // Keep last 20
  } catch (error) {
    console.error('Failed to save report to history:', error);
  }
};

const History = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

  useEffect(() => {
    setHistory(getSavedHistory());
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('careeros_analysis_history');
    setHistory([]);
    setSelectedReport(null);
    toast({ title: 'History Cleared', description: 'All stored analysis reports have been removed.' });
  };

  const avgScore = history.length > 0
    ? Math.round(history.reduce((acc, item) => acc + item.analysis.score, 0) / history.length)
    : 0;

  const avgAtsScore = history.length > 0
    ? Math.round(history.reduce((acc, item) => acc + item.analysis.atsAnalysis.score, 0) / history.length)
    : 0;

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
              ← Back to History List
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
            {/* Header Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1d1d1f]">
                  Analysis History
                </h1>
                <p className="text-base text-[#86868b] mt-1">
                  Track candidate resume score trajectory & past evaluations over time.
                </p>
              </div>

              {history.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearHistory}
                  className="apple-button-secondary border-none self-start md:self-auto text-sm text-[#ff3b30] hover:bg-[#ff3b30]/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear History
                </Button>
              )}
            </div>

            {/* Score Trajectory Stats Cards */}
            {history.length > 0 && (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="apple-card p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#86868b]">Total Analyzed</span>
                    <HistoryIcon className="h-5 w-5 text-[#0071e3]" />
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-[#1d1d1f]">{history.length}</span>
                    <span className="text-xs text-[#86868b] ml-2">reports saved</span>
                  </div>
                </div>

                <div className="apple-card p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#86868b]">Avg Resume Score</span>
                    <TrendingUp className="h-5 w-5 text-[#34c759]" />
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-[#0071e3]">{avgScore}</span>
                    <span className="text-xs text-[#86868b] ml-2">/ 100</span>
                  </div>
                </div>

                <div className="apple-card p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#86868b]">Avg ATS Compliance</span>
                    <Sparkles className="h-5 w-5 text-[#34c759]" />
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-[#34c759]">{avgAtsScore}</span>
                    <span className="text-xs text-[#86868b] ml-2">/ 100</span>
                  </div>
                </div>
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
              <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f]">Saved Evaluations</h2>
                <div className="grid gap-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedReport(item)}
                      className="apple-card apple-card-hover p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4 min-w-0">
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
                              Role: {item.jobDescription}
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
                        <ArrowUpRight className="h-5 w-5 text-[#86868b]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
