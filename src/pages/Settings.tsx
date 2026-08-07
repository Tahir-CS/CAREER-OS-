import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Settings as SettingsIcon, User, Briefcase, MapPin, DollarSign, Database, Save, Check, Plus, X, Download, Upload, Sliders } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { getSavedHistory } from './History';

export interface UserPreferences {
  targetRole: string;
  experienceLevel: string;
  workPreference: string;
  targetSalary: string;
  aiStrictness: 'strict' | 'standard' | 'supportive';
  skills: string[];
}

const DEFAULT_PREFS: UserPreferences = {
  targetRole: 'Senior Frontend & AI Systems Engineer',
  experienceLevel: 'Senior / Lead',
  workPreference: 'Remote',
  targetSalary: '$140,000 - $180,000',
  aiStrictness: 'strict',
  skills: ['TypeScript', 'React', 'Node.js', 'Python', 'Docker', 'PostgreSQL', 'Redis', 'System Design'],
};

const Settings = () => {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('careeros_user_prefs');
      if (stored) setPrefs(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('careeros_user_prefs', JSON.stringify(prefs));
      setSaved(true);
      toast({ title: 'Settings Saved', description: 'Career profile & AI preferences updated.' });
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !prefs.skills.includes(newSkill.trim())) {
      setPrefs({ ...prefs, skills: [...prefs.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setPrefs({ ...prefs, skills: prefs.skills.filter((s) => s !== skillToRemove) });
  };

  const handleExportBackup = () => {
    try {
      const history = getSavedHistory();
      const backupData = {
        preferences: prefs,
        history,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CareerOS-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'Backup Exported', description: 'Career profile & analysis history downloaded as JSON.' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    setPrefs(DEFAULT_PREFS);
    toast({ title: 'Storage Reset', description: 'All local data & history cleared successfully.' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="outline" className="chip-mono rounded-full border-none bg-[#0071e3]/10 px-3.5 py-1 text-xs font-semibold text-[#0071e3] mb-3">
            Career Profile &amp; AI Engine Configuration
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1d1d1f]">
            Candidate Settings &amp; Preferences
          </h1>
          <p className="text-base text-[#86868b] mt-2">
            Configure your target career roles, primary technical skills, AI strictness level, and data backups.
          </p>
        </div>

        <div className="space-y-6">
          {/* Career Profile Card */}
          <div className="apple-card p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f] flex items-center gap-2.5">
              <User className="h-5 w-5 text-[#0071e3]" />
              Target Role &amp; Preferences
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#0071e3]" />
                  Primary Target Role
                </label>
                <Input
                  value={prefs.targetRole}
                  onChange={(e) => setPrefs({ ...prefs, targetRole: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="rounded-xl border border-border/80 bg-[#f5f5f7] h-11 text-sm focus:border-[#0071e3]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#34c759]" />
                  Preferred Work Mode
                </label>
                <select
                  value={prefs.workPreference}
                  onChange={(e) => setPrefs({ ...prefs, workPreference: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-[#f5f5f7] h-11 px-3 text-sm font-medium focus:border-[#0071e3] outline-none"
                >
                  <option value="Remote">Remote Only</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#34c759]" />
                  Target Salary Compensation Range
                </label>
                <Input
                  value={prefs.targetSalary}
                  onChange={(e) => setPrefs({ ...prefs, targetSalary: e.target.value })}
                  placeholder="e.g. $140k - $180k"
                  className="rounded-xl border border-border/80 bg-[#f5f5f7] h-11 text-sm focus:border-[#0071e3]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1d1d1f]">Target Seniority Level</label>
                <Input
                  value={prefs.experienceLevel}
                  onChange={(e) => setPrefs({ ...prefs, experienceLevel: e.target.value })}
                  placeholder="e.g. Senior / Staff / Lead"
                  className="rounded-xl border border-border/80 bg-[#f5f5f7] h-11 text-sm focus:border-[#0071e3]"
                />
              </div>
            </div>

            {/* Core Skills Tag Cloud */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-bold text-[#1d1d1f]">Candidate Core Technical Skills Tag Cloud</label>
              <div className="flex flex-wrap gap-2">
                {prefs.skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="chip-mono rounded-full bg-[#0071e3]/10 text-[#0071e3] px-3 py-1 text-xs font-semibold flex items-center gap-1.5 border-none"
                  >
                    <span>{skill}</span>
                    <X className="h-3.5 w-3.5 cursor-pointer hover:text-[#ff3b30]" onClick={() => removeSkill(skill)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a new skill (e.g. Docker, GraphQL)..."
                  className="rounded-xl border border-border/80 bg-[#f5f5f7] h-10 text-sm focus:border-[#0071e3]"
                />
                <Button onClick={addSkill} className="apple-button h-10 px-4 text-xs font-semibold">
                  <Plus className="h-4 w-4" /> Add Skill
                </Button>
              </div>
            </div>
          </div>

          {/* AI Analysis Tuning Card */}
          <div className="apple-card p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f] flex items-center gap-2.5">
              <Sliders className="h-5 w-5 text-[#34c759]" />
              AI Agent Review Strictness Mode
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div
                onClick={() => setPrefs({ ...prefs, aiStrictness: 'strict' })}
                className={`apple-card apple-card-hover p-4 cursor-pointer border-2 transition-all ${
                  prefs.aiStrictness === 'strict' ? 'border-[#0071e3] bg-[#0071e3]/5 shadow-sm' : 'border-border/70'
                }`}
              >
                <h4 className="font-bold text-[#0071e3] text-sm">Strict Senior Bar</h4>
                <p className="text-xs text-[#86868b] mt-1">High bar evaluation modeling Principal FAANG hiring managers.</p>
              </div>

              <div
                onClick={() => setPrefs({ ...prefs, aiStrictness: 'standard' })}
                className={`apple-card apple-card-hover p-4 cursor-pointer border-2 transition-all ${
                  prefs.aiStrictness === 'standard' ? 'border-[#34c759] bg-[#34c759]/5 shadow-sm' : 'border-border/70'
                }`}
              >
                <h4 className="font-bold text-[#34c759] text-sm">Standard Review</h4>
                <p className="text-xs text-[#86868b] mt-1">Balanced feedback covering major strengths &amp; ATS formatting.</p>
              </div>

              <div
                onClick={() => setPrefs({ ...prefs, aiStrictness: 'supportive' })}
                className={`apple-card apple-card-hover p-4 cursor-pointer border-2 transition-all ${
                  prefs.aiStrictness === 'supportive' ? 'border-[#af52de] bg-[#af52de]/5 shadow-sm' : 'border-border/70'
                }`}
              >
                <h4 className="font-bold text-[#af52de] text-sm">Supportive Career Guide</h4>
                <p className="text-xs text-[#86868b] mt-1">Encouraging analysis tailored for career transitioners.</p>
              </div>
            </div>
          </div>

          {/* Backup & Export Storage Management Card */}
          <div className="apple-card p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f] flex items-center gap-2.5">
              <Database className="h-5 w-5 text-[#af52de]" />
              Backup &amp; Storage Management
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border/60 pt-4">
              <div>
                <p className="text-base font-bold text-[#1d1d1f]">Export Career Profile &amp; History Backup</p>
                <p className="text-sm text-[#86868b]">Download full profile preferences and saved reports as a JSON backup.</p>
              </div>
              <Button
                variant="outline"
                onClick={handleExportBackup}
                className="apple-button-secondary border-none text-xs"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 text-[#0071e3]" />
                Export JSON Backup
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border/60 pt-4">
              <div>
                <p className="text-base font-bold text-[#1d1d1f]">Clear Local Storage &amp; History</p>
                <p className="text-sm text-[#86868b]">Deletes cached resume evaluations and preferences from your browser.</p>
              </div>
              <Button
                variant="outline"
                onClick={handleClearCache}
                className="apple-button-secondary border-none text-xs text-[#ff3b30] hover:bg-[#ff3b30]/10"
              >
                Reset All Local Storage
              </Button>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} className="apple-button h-12 px-8 font-semibold">
              {saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Preferences Saved!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Career Profile Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
