import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BriefcaseBusiness, Check, MapPin, Search, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface CareerProfile {
  headline: string;
  targetRoles: string[];
  skills: string[];
  seniority: string;
  yearsExperience: number | null;
  location: string;
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  applyUrl?: string;
  createdAt?: string | null;
  source: string;
  workplaceType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  matchedSkills: string[];
  missingSkills: string[];
  evidenceCount: number;
  requirementCount: number;
  fitLabel: 'Strong fit' | 'Possible fit' | 'Explore';
}

const markets = [
  ['us', 'United States'],
  ['gb', 'United Kingdom'],
  ['ca', 'Canada'],
  ['au', 'Australia'],
  ['in', 'India'],
  ['de', 'Germany'],
  ['fr', 'France'],
  ['nl', 'Netherlands'],
  ['nz', 'New Zealand'],
  ['za', 'South Africa'],
];

const formatPosted = (value?: string | null) => {
  if (!value) return '';
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return '';
  const days = Math.max(0, Math.floor((Date.now() - time) / 86_400_000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const Jobs = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const analysisId = searchParams.get('analysisId') || '';
  const [country, setCountry] = useState(() => localStorage.getItem('career_os_job_country') || 'us');
  const [location, setLocation] = useState('');
  const [appliedLocation, setAppliedLocation] = useState('');
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preparingId, setPreparingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [providerMissing, setProviderMissing] = useState(false);

  useEffect(() => {
    if (!analysisId) return;
    const controller = new AbortController();

    const loadJobs = async () => {
      setIsLoading(true);
      setError('');
      setProviderMissing(false);
      try {
        const params = new URLSearchParams({ country, limit: '30' });
        if (appliedLocation.trim()) params.set('location', appliedLocation.trim());
        const response = await fetch(`${API_BASE_URL}/jobs/matches/${analysisId}?${params}`, { signal: controller.signal });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (data?.code === 'JOB_PROVIDER_NOT_CONFIGURED') setProviderMissing(true);
          throw new Error(data?.message || 'Could not load job matches.');
        }
        setProfile(data.profile || null);
        setQuery(data.query || '');
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        localStorage.setItem('career_os_job_country', country);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setJobs([]);
        setError(fetchError instanceof Error ? fetchError.message : 'Could not load job matches.');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
    return () => controller.abort();
  }, [analysisId, country, appliedLocation]);

  const counts = useMemo(() => ({
    strong: jobs.filter((job) => job.fitLabel === 'Strong fit').length,
    possible: jobs.filter((job) => job.fitLabel === 'Possible fit').length,
  }), [jobs]);

  const prepareApplication = async (job: JobMatch) => {
    setPreparingId(job.id);
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/matches/${analysisId}/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          description: job.description,
          url: job.url,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.jobId) throw new Error(data?.message || 'Could not prepare this application.');
      navigate(`/app?jobId=${encodeURIComponent(data.jobId)}&prepared=1`);
    } catch (prepareError) {
      toast({
        title: 'Could not prepare application',
        description: prepareError instanceof Error ? prepareError.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPreparingId(null);
    }
  };

  if (!analysisId) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        <Header />
        <main className="mx-auto max-w-[980px] px-5 py-20 text-center">
          <h1 className="text-5xl font-semibold tracking-[-0.05em]">Start with your resume.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-7 text-[#6e6e73]">CareerOS needs your resume evidence before it can rank live jobs.</p>
          <Button className="apple-button mt-8 rounded-full" onClick={() => navigate('/app')}>Upload resume</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <Header />
      <main className="mx-auto max-w-[1180px] px-5 pb-20 pt-10 md:px-8 md:pt-14">
        <section className="rounded-[30px] bg-white px-6 py-8 ring-1 ring-black/[0.04] md:px-10 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[13px] font-semibold text-[#6e6e73]">Jobs for you</p>
              <h1 className="mt-3 max-w-[760px] text-[44px] font-semibold leading-[0.98] tracking-[-0.05em] md:text-[64px]">
                Roles your resume can actually support.
              </h1>
              <p className="mt-5 max-w-2xl text-[17px] leading-7 text-[#6e6e73]">
                CareerOS searches live listings, then ranks them against evidence already present in your resume. No invented experience and no mystery score.
              </p>
            </div>
            {profile && (
              <div className="min-w-[250px] rounded-[22px] bg-[#f5f5f7] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">Resume profile</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.025em]">{profile.targetRoles?.[0] || profile.headline || 'Career profile'}</p>
                <p className="mt-2 text-sm leading-5 text-[#6e6e73]">{profile.skills.slice(0, 6).join(' · ')}</p>
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-3 border-t border-black/[0.07] pt-6 md:grid-cols-[210px_1fr_auto]">
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="h-11 rounded-xl border border-black/[0.1] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
              aria-label="Job market"
            >
              {markets.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#86868b]" />
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setAppliedLocation(location);
                }}
                placeholder="City or region (optional)"
                className="h-11 rounded-xl border-black/[0.1] bg-white pl-9"
              />
            </div>
            <Button className="apple-button h-11 rounded-full px-5" onClick={() => setAppliedLocation(location)}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </section>

        {!isLoading && !error && jobs.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2 text-sm text-[#6e6e73]">
            <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-black/[0.05]">{jobs.length} relevant openings</span>
            <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-black/[0.05]">{counts.strong} strong fits</span>
            {counts.possible > 0 && <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-black/[0.05]">{counts.possible} possible fits</span>}
            {query && <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-black/[0.05]">Searching: {query}</span>}
          </div>
        )}

        {isLoading && (
          <section className="mt-5 rounded-[28px] bg-white p-8 ring-1 ring-black/[0.04]">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#1d1d1f]" />
              <p className="font-medium">Searching live openings and comparing evidence…</p>
            </div>
          </section>
        )}

        {!isLoading && error && (
          <section className="mt-5 rounded-[28px] bg-white p-8 ring-1 ring-black/[0.04]">
            <h2 className="text-2xl font-semibold tracking-[-0.035em]">{providerMissing ? 'Live job search needs a provider.' : 'Job search is unavailable right now.'}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6e6e73]">{error}</p>
            {providerMissing && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6e6e73]">
                Configure Adzuna credentials or public Greenhouse / Lever board sources on the backend. CareerOS intentionally does not display fabricated listings when no live source is connected.
              </p>
            )}
          </section>
        )}

        {!isLoading && !error && jobs.length === 0 && (
          <section className="mt-5 rounded-[28px] bg-white p-8 ring-1 ring-black/[0.04]">
            <h2 className="text-2xl font-semibold tracking-[-0.035em]">No useful matches in this search.</h2>
            <p className="mt-3 text-sm leading-6 text-[#6e6e73]">Try another market or a broader location. CareerOS hides low-signal listings instead of padding the feed.</p>
          </section>
        )}

        <div className="mt-5 grid gap-4">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-[28px] bg-white p-6 ring-1 ring-black/[0.04] md:p-8">
              <div className="grid gap-7 md:grid-cols-[1fr_240px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6e6e73]">
                    <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 font-medium text-[#1d1d1f]">{job.fitLabel}</span>
                    <span>{job.source}</span>
                    {formatPosted(job.createdAt) && <><span>·</span><span>{formatPosted(job.createdAt)}</span></>}
                  </div>
                  <h2 className="mt-4 text-[30px] font-semibold leading-tight tracking-[-0.04em]">{job.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6e6e73]">
                    <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="h-4 w-4" /> {job.company}</span>
                    {job.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</span>}
                  </div>

                  <p className="mt-5 line-clamp-3 max-w-3xl text-sm leading-6 text-[#6e6e73]">{job.description}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {job.matchedSkills.slice(0, 6).map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium">
                        <Check className="h-3 w-3" /> {skill}
                      </span>
                    ))}
                    {job.missingSkills.slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded-full border border-black/[0.08] px-3 py-1.5 text-xs text-[#6e6e73]">Needs evidence: {skill}</span>
                    ))}
                  </div>
                </div>

                <aside className="flex flex-col justify-between rounded-[22px] bg-[#f5f5f7] p-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">Evidence coverage</p>
                    <p className="mt-2 text-[28px] font-semibold tracking-[-0.04em]">
                      {job.requirementCount > 0 ? `${job.evidenceCount} of ${job.requirementCount}` : 'Role-led'}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#6e6e73]">Recognized requirements already supported by your resume.</p>
                  </div>
                  <div className="mt-7 grid gap-2">
                    <Button
                      className="apple-button h-10 rounded-full"
                      onClick={() => prepareApplication(job)}
                      disabled={preparingId === job.id}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {preparingId === job.id ? 'Preparing…' : 'Prepare application'}
                    </Button>
                    <a
                      href={job.applyUrl || job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm font-medium text-[#1d1d1f] hover:bg-black/[0.04]"
                    >
                      View original <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </aside>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Jobs;
