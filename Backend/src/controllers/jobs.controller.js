import { PrismaClient } from '@prisma/client';
import { analysisQueue } from '../config/queue.js';
import { discoverJobs } from '../services/jobDiscovery.js';

const prisma = new PrismaClient();
const DEFAULT_COUNTRY = process.env.JOB_SEARCH_DEFAULT_COUNTRY || 'us';

const getCountry = (value) => {
  const country = String(value || DEFAULT_COUNTRY).trim().toLowerCase();
  return /^[a-z]{2}$/.test(country) ? country : DEFAULT_COUNTRY;
};

export const getJobMatches = async (req, res) => {
  try {
    const analysis = await prisma.analysisJob.findUnique({ where: { id: req.params.analysisId } });
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Resume analysis not found.' });
    }
    if (analysis.status !== 'COMPLETED' || !analysis.feedback) {
      return res.status(409).json({ success: false, message: 'Resume analysis is not complete yet.' });
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 50);
    const country = getCountry(req.query.country);
    const location = String(req.query.location || '').trim().slice(0, 120);
    const result = await discoverJobs({ feedback: analysis.feedback, country, location, limit });

    return res.json({
      success: true,
      country,
      location,
      query: result.query,
      profile: result.profile,
      jobs: result.jobs,
    });
  } catch (error) {
    console.error('[API Error] Failed to discover job matches:', error);
    if (error.code === 'JOB_PROVIDER_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        code: error.code,
        message: 'Live job discovery is not configured on this deployment yet.',
      });
    }
    if (error.code === 'CAREER_PROFILE_INCOMPLETE') {
      return res.status(422).json({ success: false, code: error.code, message: error.message });
    }
    return res.status(502).json({ success: false, message: 'Could not retrieve live job listings right now.' });
  }
};

export const prepareJobMatch = async (req, res) => {
  try {
    const sourceAnalysis = await prisma.analysisJob.findUnique({ where: { id: req.params.analysisId } });
    if (!sourceAnalysis) {
      return res.status(404).json({ success: false, message: 'Resume analysis not found.' });
    }
    if (sourceAnalysis.status !== 'COMPLETED') {
      return res.status(409).json({ success: false, message: 'Resume analysis is not complete yet.' });
    }

    const title = String(req.body?.title || '').trim().slice(0, 240);
    const company = String(req.body?.company || '').trim().slice(0, 240);
    const description = String(req.body?.description || '').trim().slice(0, 25_000);
    const sourceUrl = String(req.body?.url || '').trim().slice(0, 2_000);

    if (!title || description.length < 40) {
      return res.status(400).json({ success: false, message: 'The selected job is missing enough description text to prepare an application.' });
    }

    const jobDescription = [
      title,
      company ? `Company: ${company}` : '',
      sourceUrl ? `Source: ${sourceUrl}` : '',
      '',
      description,
    ].filter(Boolean).join('\n');

    const newJob = await prisma.analysisJob.create({
      data: {
        resumeUrl: sourceAnalysis.resumeUrl,
        status: 'PENDING',
        jobDescription,
        sessionId: sourceAnalysis.sessionId || null,
      },
    });

    await analysisQueue.add('process-resume', {
      jobId: newJob.id,
      jobDescription,
    });

    return res.status(202).json({
      success: true,
      jobId: newJob.id,
      status: newJob.status,
    });
  } catch (error) {
    console.error('[API Error] Failed to prepare selected job:', error);
    return res.status(500).json({ success: false, message: 'Could not prepare this application.' });
  }
};
