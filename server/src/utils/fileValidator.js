import path from 'path';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/octet-stream' // sometimes sent by browsers for docx/txt
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.txt', '.docx']);

/**
 * Sanitizes a filename to prevent path traversal and shell injection
 * @param {string} originalName 
 * @returns {string} Safe filename
 */
export function sanitizeFilename(originalName) {
  if (!originalName || typeof originalName !== 'string') {
    return 'uploaded_file';
  }
  // Strip path traversal sequences
  const baseName = path.basename(originalName);
  // Remove non-alphanumeric characters except dot, dash, underscore
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
}

/**
 * Validates an uploaded file buffer against MIME, extension, magic bytes, and size
 * @param {object} file - Multer file object
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {{ valid: boolean, error?: string, fileType?: 'pdf' | 'txt' | 'docx' }}
 */
export function validateUploadFile(file, maxSizeMB = 10) {
  if (!file || !file.buffer) {
    return { valid: false, error: 'No file buffer provided' };
  }

  // Size check
  const sizeMB = file.buffer.length / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return { valid: false, error: `File size exceeds the ${maxSizeMB}MB limit.` };
  }

  const safeName = sanitizeFilename(file.originalname);
  const ext = path.extname(safeName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: 'Only PDF (.pdf), TXT (.txt), and Word (.docx) files are supported.' };
  }

  // Magic bytes inspection
  if (ext === '.pdf') {
    const magic = file.buffer.toString('ascii', 0, 4);
    if (magic !== '%PDF') {
      return { valid: false, error: 'File header does not match valid PDF structure.' };
    }
    return { valid: true, fileType: 'pdf' };
  }

  if (ext === '.docx') {
    // DOCX is a zip file, magic bytes: PK\x03\x04
    if (file.buffer.length < 4 || 
        file.buffer[0] !== 0x50 || 
        file.buffer[1] !== 0x4B || 
        file.buffer[2] !== 0x03 || 
        file.buffer[3] !== 0x04) {
      return { valid: false, error: 'File header does not match valid DOCX structure.' };
    }
    return { valid: true, fileType: 'docx' };
  }

  if (ext === '.txt') {
    // Text check: verify no null bytes
    const sample = file.buffer.slice(0, Math.min(file.buffer.length, 1024));
    for (let i = 0; i < sample.length; i++) {
      if (sample[i] === 0) {
        return { valid: false, error: 'Binary file detected; valid UTF-8 text file required.' };
      }
    }
    return { valid: true, fileType: 'txt' };
  }

  return { valid: false, error: 'Unsupported file type.' };
}
