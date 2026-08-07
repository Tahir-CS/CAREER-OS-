import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Settings as SettingsIcon, User, Briefcase, MapPin, DollarSign, Database, Save, Check } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

export interface UserPreferences {
  targetRole: string;
  experienceLevel: string;
  workPreference: string;
  targetSalary: string;
  enableVoiceResponse: boolean;
}

const DEFAULT_PREFS: UserPreferences = {
  targetRole: 'Senior Frontend & AI Systems Engineer',
  experienceLevel: 'Senior / Lead',
  workPreference: 'Remote',
  targetSalary: '$140,000 - $180,000',
  enableVoiceResponse: true,
};

const Settings = () => {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
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
      toast({ title: 'Settings Saved', description: 'Career profile & system preferences updated.' });
      setTimeout(() => setSaved(false), 2000);
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
            Career Profile &amp; Preferences
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1d1d1f]">
            Candidate Settings
          </h1>
          <p className="text-base text-[#86868b] mt-2">
            Configure your target roles, work mode preferences, and system options.
          </p>
        </div>

        <div className="space-y-6">
          {/* Career Profile Card */}
          <div className="apple-card p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f] flex items-center gap-2.5">
              <User className="h-5 w-5 text-[#0071e3]" />
              Career Profile Targets
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
                <label className="text-sm font-bold text-[#1d1d1f]">Target Experience Level</label>
                <Input
                  value={prefs.experienceLevel}
                  onChange={(e) => setPrefs({ ...prefs, experienceLevel: e.target.value })}
                  placeholder="e.g. Senior / Staff"
                  className="rounded-xl border border-border/80 bg-[#f5f5f7] h-11 text-sm focus:border-[#0071e3]"
                />
              </div>
            </div>
          </div>

          {/* Data & Storage Management Card */}
          <div className="apple-card p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-[#1d1d1f] flex items-center gap-2.5">
              <Database className="h-5 w-5 text-[#af52de]" />
              Data &amp; Local Storage Management
            </h2>

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
