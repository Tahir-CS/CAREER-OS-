import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

const isPdf = (buffer) => buffer.subarray(0, 5).toString('utf8') === '%PDF-';

const extractPdfText = async (buffer) => {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text || '';
  } finally {
    await parser.destroy();
  }
};

const extractDocxText = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || '';
};

/**
 * Extract readable text from the resume bytes downloaded from object storage.
 * We detect PDF by its file signature; every other accepted upload is treated as DOCX.
 */
export const extractTextFromResumeBuffer = async (buffer) => {
  try {
    return isPdf(buffer) ? await extractPdfText(buffer) : await extractDocxText(buffer);
  } catch (error) {
    console.error('Error extracting resume text:', error);
    throw new Error('Failed to extract readable text from the uploaded resume');
  }
};
