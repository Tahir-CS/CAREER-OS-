const SKILL_TERMS = [
  'javascript', 'typescript', 'react', 'next.js', 'node.js', 'node', 'express', 'python', 'django', 'flask',
  'java', 'spring', 'c#', '.net', 'go', 'golang', 'rust', 'ruby', 'rails', 'php', 'laravel', 'swift', 'kotlin',
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'sql', 'graphql', 'rest', 'api', 'apis', 'grpc',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'linux', 'git', 'github actions',
  'ci/cd', 'jenkins', 'kafka', 'rabbitmq', 'bullmq', 'elasticsearch', 'opensearch', 'snowflake', 'databricks',
  'pytorch', 'tensorflow', 'machine learning', 'llm', 'rag', 'nlp', 'computer vision', 'figma', 'tailwind',
  'product management', 'agile', 'scrum', 'data analysis', 'tableau', 'power bi', 'excel', 'salesforce',
];

const aliases = new Map([
  ['node', 'node.js'],
  ['postgres', 'postgresql'],
  ['apis', 'api'],
  ['golang', 'go'],
  ['ci/cd', 'ci/cd'],
]);

const cleanText = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const normalize = (value = '') => cleanText(value).toLowerCase();
const canonicalSkill = (skill) => aliases.get(normalize(skill)) || normalize(skill);

const unique = (values) => [...new Set(values.filter(Boolean))];

const parseConfiguredSources = (raw) => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [company, token] = entry.includes('|') ? entry.split('|', 2) : [entry, entry];
      return { company: company.trim(), token: token.trim() };
    })
    .filter((entry) => entry.token);
};

const getCareerProfile = (feedback = {}) => {
  const profile = feedback.careerProfile || {};
  const targetRoles = Array.isArray(profile.targetRoles) ? profile.targetRoles.filter(Boolean).slice(0, 5) : [];
  const skills = Array.isArray(profile.skills)
    ? unique(profile.skills.map(canonicalSkill)).filter((skill) => skill.length > 1).slice(0, 30)
    : [];

  return {
    headline: cleanText(profile.headline || feedback.summary || ''),
    targetRoles,
    skills,
    seniority: cleanText(profile.seniority || ''),
    yearsExperience: Number.isFinite(Number(profile.yearsExperience)) ? Number(profile.yearsExperience) : null,
    location: cleanText(profile.location || ''),
  };
};

const extractJobSkills = (jobText) => {
  const text = normalize(jobText);
  return unique(
    SKILL_TERMS
      .filter((term) => text.includes(term))
      .map(canonicalSkill)
  );
};

const roleTokens = (profile) => {
  const role = normalize(profile.targetRoles[0] || profile.headline);
  return role
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length > 2 && !['senior', 'junior', 'lead', 'staff', 'engineer', 'developer'].includes(token))
    .slice(0, 5);
};

const scoreJob = (job, profile) => {
  const haystack = normalize(`${job.title} ${job.description}`);
  const title = normalize(job.title);
  const targetTokens = roleTokens(profile);
  const titleHits = targetTokens.filter((token) => title.includes(token));
  const jobSkills = extractJobSkills(haystack);
  const profileSkillSet = new Set(profile.skills.map(canonicalSkill));
  const matchedSkills = jobSkills.filter((skill) => profileSkillSet.has(skill));
  const missingSkills = jobSkills.filter((skill) => !profileSkillSet.has(skill)).slice(0, 8);
  const evidenceCoverage = jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0;

  const roleScore = targetTokens.length === 0 ? 20 : Math.min(50, (titleHits.length / targetTokens.length) * 50);
  const skillScore = Math.min(40, evidenceCoverage * 40 + Math.min(matchedSkills.length, 4) * 2);
  const postedAt = job.createdAt ? new Date(job.createdAt).getTime() : 0;
  const ageDays = postedAt ? Math.max(0, (Date.now() - postedAt) / 86_400_000) : null;
  const recencyScore = ageDays === null ? 0 : ageDays <= 2 ? 10 : ageDays <= 7 ? 7 : ageDays <= 30 ? 3 : 0;
  const rankScore = Math.round(roleScore + skillScore + recencyScore);

  return {
    ...job,
    matchedSkills: matchedSkills.slice(0, 8),
    missingSkills,
    evidenceCount: matchedSkills.length,
    requirementCount: jobSkills.length,
    fitLabel: rankScore >= 72 ? 'Strong fit' : rankScore >= 48 ? 'Possible fit' : 'Explore',
    _rankScore: rankScore,
  };
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Job source request failed with ${response.status}`);
  return response.json();
};

const searchAdzuna = async ({ query, country, location, limit }) => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: String(Math.min(Math.max(limit, 10), 50)),
    what: query,
    'content-type': 'application/json',
    sort_by: 'date',
  });
  if (location) params.set('where', location);

  const payload = await fetchJson(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`);
  return (payload.results || []).map((job) => ({
    id: `adzuna:${job.id}`,
    title: cleanText(job.title),
    company: cleanText(job.company?.display_name || 'Company not listed'),
    location: cleanText(job.location?.display_name || ''),
    description: cleanText(job.description || ''),
    url: job.redirect_url,
    createdAt: job.created || null,
    source: 'Adzuna',
    salaryMin: Number.isFinite(job.salary_min) ? job.salary_min : null,
    salaryMax: Number.isFinite(job.salary_max) ? job.salary_max : null,
    salaryCurrency: job.salary_currency || null,
  }));
};

const searchGreenhouse = async () => {
  const boards = parseConfiguredSources(process.env.GREENHOUSE_JOB_BOARDS);
  if (boards.length === 0) return [];

  const results = await Promise.allSettled(boards.slice(0, 20).map(async ({ company, token }) => {
    const payload = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs?content=true`);
    return (payload.jobs || []).map((job) => ({
      id: `greenhouse:${token}:${job.id}`,
      title: cleanText(job.title),
      company,
      location: cleanText(job.location?.name || ''),
      description: cleanText(job.content || ''),
      url: job.absolute_url,
      createdAt: job.updated_at || null,
      source: 'Greenhouse',
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
    }));
  }));

  return results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
};

const searchLever = async () => {
  const sites = parseConfiguredSources(process.env.LEVER_JOB_SITES);
  if (sites.length === 0) return [];

  const results = await Promise.allSettled(sites.slice(0, 20).map(async ({ company, token }) => {
    const payload = await fetchJson(`https://api.lever.co/v0/postings/${encodeURIComponent(token)}?mode=json`);
    return (Array.isArray(payload) ? payload : []).map((job) => ({
      id: `lever:${token}:${job.id}`,
      title: cleanText(job.text),
      company,
      location: cleanText(job.categories?.location || job.country || ''),
      description: cleanText(job.descriptionPlain || job.description || ''),
      url: job.hostedUrl,
      applyUrl: job.applyUrl,
      createdAt: null,
      source: 'Lever',
      salaryMin: Number.isFinite(job.salaryRange?.min) ? job.salaryRange.min : null,
      salaryMax: Number.isFinite(job.salaryRange?.max) ? job.salaryRange.max : null,
      salaryCurrency: job.salaryRange?.currency || null,
      workplaceType: job.workplaceType || null,
    }));
  }));

  return results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
};

const isRelevant = (job, profile) => {
  const title = normalize(job.title);
  const text = normalize(`${job.title} ${job.description}`);
  const targets = roleTokens(profile);
  const targetHit = targets.some((token) => title.includes(token));
  const skillHits = profile.skills.filter((skill) => text.includes(skill)).length;
  return targetHit || skillHits >= 2 || targets.length === 0;
};

const dedupeJobs = (jobs) => {
  const seen = new Set();
  return jobs.filter((job) => {
    const key = normalize(job.url || `${job.company}:${job.title}:${job.location}`);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const discoverJobs = async ({ feedback, country, location = '', limit = 24 }) => {
  const profile = getCareerProfile(feedback);
  const query = cleanText(profile.targetRoles[0] || profile.headline || profile.skills.slice(0, 3).join(' '));
  if (!query) {
    const error = new Error('Career profile is missing searchable role information');
    error.code = 'CAREER_PROFILE_INCOMPLETE';
    throw error;
  }

  const hasProvider = Boolean(
    (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) ||
    process.env.GREENHOUSE_JOB_BOARDS ||
    process.env.LEVER_JOB_SITES
  );
  if (!hasProvider) {
    const error = new Error('No live job source is configured');
    error.code = 'JOB_PROVIDER_NOT_CONFIGURED';
    throw error;
  }

  const providerResults = await Promise.allSettled([
    searchAdzuna({ query, country, location, limit }),
    searchGreenhouse(),
    searchLever(),
  ]);

  const jobs = providerResults.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  const ranked = dedupeJobs(jobs)
    .filter((job) => isRelevant(job, profile))
    .map((job) => scoreJob(job, profile))
    .sort((a, b) => b._rankScore - a._rankScore)
    .slice(0, Math.min(Math.max(limit, 1), 50))
    .map(({ _rankScore, ...job }) => job);

  return { profile, query, jobs: ranked };
};
