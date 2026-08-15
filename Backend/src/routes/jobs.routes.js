import express from 'express';
import { getJobMatches, prepareJobMatch } from '../controllers/jobs.controller.js';

const router = express.Router();

router.get('/jobs/matches/:analysisId', getJobMatches);
router.post('/jobs/matches/:analysisId/prepare', prepareJobMatch);

export default router;
