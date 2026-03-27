import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extract text from a PDF buffer with improved error handling
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<string>} - Extracted text from PDF
 */
export async function extractTextFromPDF(pdfBuffer) {
  if (!pdfBuffer) {
    throw new Error('PDF buffer is required');
  }

  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error('Input must be a Buffer');
  }

  try {
    console.log(`[PDF] Starting extraction, buffer size: ${pdfBuffer.length} bytes`);
    
    // Configure pdf-parse options for better text extraction
    const options = {
      max: 0, // 0 = no limit on pages
      version: 'v2.4.456'
    };
    
    const data = await pdfParse(pdfBuffer, options);
    
    console.log(`[PDF] Extraction completed`);
    console.log(`[PDF] Pages: ${data.numpages}, Text length: ${data.text?.length || 0}`);
    
    if (!data) {
      throw new Error('PDF parsing returned no data');
    }

    // Check if we got any text at all
    if (!data.text || data.text.trim().length === 0) {
      // This might be an image-based or scanned PDF
      throw new Error(
        'No text content found in PDF. This might be a scanned/image-based PDF. ' +
        'Please convert it to a text-based PDF or provide a text version.'
      );
    }

    // Clean up the extracted text
    const text = data.text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    if (text.length === 0) {
      throw new Error('Extracted text is empty after cleanup');
    }

    console.log(`[PDF] Text extraction successful, ${text.length} characters extracted`);
    return text;
  } catch (error) {
    console.error('[PDF] Extraction error:', error.message);
    
    // Provide more helpful error messages
    if (error.message.includes('Invalid PDF structure')) {
      throw new Error('The file appears to be corrupted or not a valid PDF. Please try another file.');
    }
    
    if (error.message.includes('No text content found')) {
      throw error; // Re-throw as is
    }
    
    if (error.message.includes('startxref not found')) {
      throw new Error('The PDF file is corrupted or incomplete. Please try another file.');
    }

    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Validate PDF file
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @returns {boolean} - True if valid PDF
 */
export function validatePDF(buffer, filename) {
  if (!Buffer.isBuffer(buffer)) {
    return false;
  }

  // Check PDF magic number (first 4 bytes should be %PDF)
  const pdfMagic = buffer.toString('ascii', 0, 4);
  if (pdfMagic !== '%PDF') {
    return false;
  }

  // Check file extension
  if (filename && !filename.toLowerCase().endsWith('.pdf')) {
    return false;
  }

  return true;
}

/**
 * Get file size in MB
 * @param {Buffer} buffer - File buffer
 * @returns {number} - Size in MB
 */
export function getFileSizeMB(buffer) {
  return buffer.length / (1024 * 1024);
}
