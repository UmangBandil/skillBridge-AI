import mammoth from 'mammoth';

/**
 * Extracts plain text from a DOCX buffer
 * @param {Buffer} buffer - Raw file buffer
 * @returns {Promise<string>} Extracted plain text
 */
export async function extractTextFromDOCX(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty DOCX buffer provided');
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || '';
    if (!text.trim()) {
      throw new Error('DOCX document contains no readable text');
    }
    return text.trim();
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}
