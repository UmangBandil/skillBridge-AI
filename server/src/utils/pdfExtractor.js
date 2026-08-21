import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Set up PDF worker (required for pdfjs)
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Worker is in the root node_modules, not server/node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${path.join(__dirname, '../../../node_modules/pdfjs-dist/build/pdf.worker.mjs')}`;

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
    
    const { getDocument } = pdfjsLib;
    if (!getDocument) {
      throw new Error('pdfjs-dist getDocument not found');
    }
    
    console.log('[PDF] Using pdfjs-dist legacy build to parse PDF');
    
    // Convert Buffer to Uint8Array (pdfjs-dist requires this)
    const uint8Array = new Uint8Array(pdfBuffer);
    
    // Load the PDF document
    const pdfDoc = await getDocument({ data: uint8Array }).promise;
    
    console.log(`[PDF] PDF loaded, pages: ${pdfDoc.numPages}`);
    
    let text = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();

        // Group text items into lines by their vertical position so line
        // breaks survive extraction. Joining everything with spaces would
        // flatten the whole page into one line and break the section-based
        // resume parsing (education/experience detection relies on newlines).
        const pageLines = [];
        let currentLine = [];
        let currentY = null;
        for (const item of textContent.items) {
          const y = item.transform ? item.transform[5] : 0;
          if (currentY === null || Math.abs(y - currentY) <= 2) {
            if (currentY === null) currentY = y;
            currentLine.push(item.str);
          } else {
            pageLines.push(currentLine.join(' ').trim());
            currentLine = [item.str];
            currentY = y;
          }
        }
        if (currentLine.length > 0) {
          pageLines.push(currentLine.join(' ').trim());
        }
        const pageText = pageLines.filter((line) => line.length > 0).join('\n');
        text += pageText + '\n';
      } catch (pageError) {
        console.warn(`[PDF] Error extracting page ${i}:`, pageError.message);
        // Continue with next page
      }
    }
    
    // Clean up the extracted text
    text = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    if (text.length === 0) {
      throw new Error(
        'No text content found in PDF. This might be a scanned/image-based PDF. ' +
        'Please convert it to a text-based PDF or provide a text version.'
      );
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
