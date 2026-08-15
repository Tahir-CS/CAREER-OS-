import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Download, Plus, X } from 'lucide-react';
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

const reviewModes = [
  { id: 'strict' as const, name: 'High bar', text: 'Prioritise gaps, weak evidence, and senior-level expectations.' },
  { id: 'standard' as const, name: 'Balanced', text: 'Mix strengths and problems with a practical revision order.' },
  { id: 'supportive' as const, name: 'Transition', text: 'Explain gaps with more context for career changers and stretch roles.' },
];

const Settings = () => {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('careeros_user_prefs');
      if (stored) setPrefs(JSON.parse(stored));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('careeros_user_prefs', JSON.stringify(prefs));
      setSaved(true);
      toast({ title: 'Preferences saved', description: 'Your career profile was updated in this browser.' });
      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (skill && !prefs.skills.includes(skill)) {
      setPrefs({ ...prefs, skills: [...prefs.skills, skill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setPrefs({ ...prefs, skills: prefs.skills.filter((skill) => skill !== skillToRemove) });
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        preferences: prefs,
        history: getSavedHistory(),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `CareerOS-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'Backup exported', description: 'Preferences and local history were downloaded as JSON.' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    setPrefs(DEFAULT_PREFS);
    toast({ title: 'Local data cleared', description: 'Preferences and saved reports were removed from this browser.' });
  };

  return (
    <div className="min-h-screen bg-[#f3f0e7] text-[#17201d]">
      <Header />

      <main className="mx-auto max-w-6xl px-5 pb-16 md:px-8">
        <div className="border-b border-[#d2cabb] py-9 md:py-12">
          <p className="rule-label">Settings / profile</p>
          <h1 className="display-serif mt-4 text-4xl leading-[1] md:text-6xl">Career profile</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#59615c]">
            Keep the role, seniority, work preference, and skills CareerOS should use as context across the workbench.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="self-start border border-[#cfc7b7] bg-[#e9e4d8] p-5 lg:sticky lg:top-24">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#b84f31]">Stored locally</p>
            <p className="mt-3 text-sm leading-6 text-[#59615c]">These preferences live in this browser. Export a backup before clearing site data or moving devices.</p>
            <div className="mt-5 border-t border-[#cfc7b7] pt-4">
              <p className="font-mono text-[10px] text-[#85877f]">{prefs.skills.length} tracked skills</p>
              <p className="mt-1 font-mono text-[10px] text-[#85877f]">Review mode: {prefs.aiStrictness}</p>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="border border-[#cfc7b7] bg-[#faf8f2]">
              <div className="grid border-b border-[#cfc7b7] bg-[#e9e4d8] sm:grid-cols-[120px_1fr]">
                <div className="border-b border-[#cfc7b7] p-4 sm:border-b-0 sm:border-r"><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#b84f31]">Profile / 01</span></div>
                <div className="p-4"><h2 className="text-base font-semibold">Target role and constraints</h2></div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
                <div>
                  <label className="text-xs font-semibold text-[#59615c]">Primary target role</label>
                  <Input value={prefs.targetRole} onChange={(e) => setPrefs({ ...prefs, targetRole: e.target.value })} className="mt-2 h-10 rounded-none border-[#cfc7b7] bg-[#f3f0e7] focus-visible:ring-1 focus-visible:ring-[#173f35]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#59615c]">Seniority</label>
                  <Input value={prefs.experienceLevel} onChange={(e) => setPrefs({ ...prefs, experienceLevel: e.target.value })} className="mt-2 h-10 rounded-none border-[#cfc7b7] bg-[#f3f0e7] focus-visible:ring-1 focus-visible:ring-[#173f35]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#59615c]">Work preference</label>
                  <select value={prefs.workPreference} onChange={(e) => setPrefs({ ...prefs, workPreference: e.target.value })} className="mt-2 h-10 w-full border border-[#cfc7b7] bg-[#f3f0e7] px-3 text-sm outline-none focus:border-[#173f35]">
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#59615c]">Target compensation</label>
                  <Input value={prefs.targetSalary} onChange={(e) => setPrefs({ ...prefs, targetSalary: e.target.value })} className="mt-2 h-10 rounded-none border-[#cfc7b7] bg-[#f3f0e7] focus-visible:ring-1 focus-visible:ring-[#173f35]" />
                </div>
              </div>
            </section>

            <section className="border border-[#cfc7b7] bg-[#faf8f2]">
              <div className="grid border-b border-[#cfc7b7] bg-[#e9e4d8] sm:grid-cols-[120px_1fr]">
                <div className="border-b border-[#cfc7b7] p-4 sm:border-b-0 sm:border-r"><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#b84f31]">Skills / 02</span></div>
                <div className="p-4"><h2 className="text-base font-semibold">Skills you want treated as core context</h2></div>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex flex-wrap gap-2">
                  {prefs.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-2 border border-[#afc2ba] bg-[#e6eee9] px-2.5 py-1.5 font-mono text-[10px] text-[#225a4b]">
                      {skill}
                      <button onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill…"
                    className="h-10 rounded-none border-[#cfc7b7] bg-[#f3f0e7] focus-visible:ring-1 focus-visible:ring-[#173f35]"
                  />
                  <Button onClick={addSkill} className="apple-button h-10 px-4 text-xs"><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>
                </div>
              </div>
            </section>

            <section className="border border-[#cfc7b7] bg-[#faf8f2]">
              <div className="grid border-b border-[#cfc7b7] bg-[#e9e4d8] sm:grid-cols-[120px_1fr]">
                <div className="border-b border-[#cfc7b7] p-4 sm:border-b-0 sm:border-r"><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#b84f31]">Review / 03</span></div>
                <div className="p-4"><h2 className="text-base font-semibold">Feedback emphasis</h2></div>
              </div>
              <div className="grid md:grid-cols-3">
                {reviewModes.map((mode, index) => {
                  const selected = prefs.aiStrictness === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setPrefs({ ...prefs, aiStrictness: mode.id })}
                      className={`min-h-[150px] border-b border-[#d2cabb] p-5 text-left transition md:border-b-0 md:border-r ${selected ? 'bg-[#173f35] text-[#f8f5ed]' : 'hover:bg-[#f3f0e7]'}`}
                    >
                      <span className={`font-mono text-[10px] ${selected ? 'text-[#e99a7e]' : 'text-[#b84f31]'}`}>0{index + 1}</span>
                      <h3 className={`mt-5 text-sm font-semibold ${selected ? 'text-[#f8f5ed]' : ''}`}>{mode.name}</h3>
                      <p className={`mt-2 text-xs leading-5 ${selected ? 'text-[#b9c8c2]' : 'text-[#59615c]'}`}>{mode.text}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="border border-[#cfc7b7] bg-[#faf8f2] p-5 md:p-6">
              <p className="eyebrow">Data / 04</p>
              <div className="mt-4 divide-y divide-[#d2cabb] border-y border-[#d2cabb]">
                <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-sm font-semibold">Export local backup</p><p className="mt-1 text-xs text-[#72776f]">Preferences and saved report history as JSON.</p></div>
                  <Button variant="outline" onClick={handleExportBackup} className="apple-button-secondary h-9 px-3 text-xs"><Download className="mr-1.5 h-3.5 w-3.5" /> Export JSON</Button>
                </div>
                <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-sm font-semibold">Clear browser data</p><p className="mt-1 text-xs text-[#72776f]">Deletes CareerOS preferences and local report history on this device.</p></div>
                  <button onClick={handleClearCache} className="text-left text-xs font-semibold text-[#a4432c] underline decoration-[#e86e45] underline-offset-4">Clear local data</button>
                </div>
              </div>
            </section>

            <div className="flex items-center justify-between border-t border-[#d2cabb] pt-5">
              <p className="text-xs text-[#72776f]">{saved ? 'Saved in this browser.' : 'Unsaved changes stay on this page until you save.'}</p>
              <Button onClick={handleSave} className="apple-button h-10 px-5 text-sm">{saved ? 'Saved' : 'Save preferences'}</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
