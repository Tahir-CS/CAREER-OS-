// We no longer import 'fs' because files are not on the hard drive anymore!
import mammoth from 'mammoth';

// (PDF support requires reinstalling pdf-parse, which we will do in a later step)

/**
 * Extracts raw text from a DOCX file buffer.
 * Because we download the file from S3 directly into server memory,
 * we pass a Buffer instead of a local file path.
 * 
 * @param {Buffer} buffer - The raw bytes of the DOCX file downloaded from S3
 * @returns {Promise<string>} - The extracted text
 */
export const extractTextFromDOCXBuffer = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX buffer:', error);
    throw new Error('Failed to extract text from DOCX document');
  }
};
