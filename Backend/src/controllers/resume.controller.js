import { PrismaClient } from '@prisma/client';
import { analysisQueue } from '../config/queue.js';
import { generatePDFFeedback } from '../utils/pdfGenerator.js';

// We initialize our Prisma ORM client to talk to PostgreSQL
const prisma = new PrismaClient();

/**
 * NEW ARCHITECTURE: EVENT-DRIVEN POST ENDPOINT
 * This endpoint no longer calls the Gemini API directly. 
 * It only saves the file location to the DB and pushes a Job to the Queue.
 * It returns the Job ID in milliseconds.
 */
export const analyzeResume = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Since we are using multer-s3, the file object automatically contains 
    // the 'location' URL pointing to our MinIO bucket!
    const s3FileLocation = file.location || file.path; 

    // 1. Create a "PENDING" job in PostgreSQL
    const newJob = await prisma.analysisJob.create({
      data: {
        resumeUrl: s3FileLocation,
        status: 'PENDING'
      }
    });

    // 2. Push this Job ID to our Redis Queue
    // The Worker process is listening to this exact queue.
    await analysisQueue.add('process-resume', {
      jobId: newJob.id,
      jobDescription: req.body.jobDescription || ''
    });

    // 3. Immediately return the Job ID to the Frontend so it can start listening
    res.status(200).json({
      success: true,
      message: 'Resume analysis queued successfully!',
      jobId: newJob.id,
      status: newJob.status
    });

  } catch (error) {
    // PRODUCTION LOGGING PREP: In Phase 6, we will send this error to Sentry.io
    console.error('[API Error] Failed to queue resume analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue resume analysis due to a server error.',
      error: error.message
    });
  }
};

/**
 * UPDATED GET ENDPOINT
 * This now pulls the status and feedback directly from PostgreSQL instead of a volatile JS Map.
 */
export const getFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch the job from PostgreSQL
    const job = await prisma.analysisJob.findUnique({
      where: { id: id }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      status: job.status,
      feedback: job.feedback // This will be null if status is still PENDING or ANALYZING
    });

  } catch (error) {
    console.error('[API Error] Error retrieving feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving feedback',
      error: error.message
    });
  }
};

export const downloadFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await prisma.analysisJob.findUnique({
      where: { id: id }
    });

    // Ensure the job exists and is COMPLETED before generating a PDF
    if (!job || job.status !== 'COMPLETED' || !job.feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not ready or not found.'
      });
    }

    // We pass the JSON feedback to the PDF Generator
    const pdfBuffer = await generatePDFFeedback({ analysis: job.feedback });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=resume-feedback-${id}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('[API Error] Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};
