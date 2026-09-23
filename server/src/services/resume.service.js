import { validateUploadFile, sanitizeFilename } from '../utils/fileValidator.js';
import { extractTextFromPDF } from '../utils/pdfExtractor.js';
import { extractTextFromDOCX } from '../utils/docxExtractor.js';
import { parseResume } from '../ml/resume-parser.js';
import { embed } from '../ml/embedding.service.js';
import resumeRepository from '../repositories/resume.repository.js';
import userRepository from '../repositories/user.repository.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

export const resumeService = {
  processUpload: async (file, userId) => {
    // 1. Validation
    const validation = validateUploadFile(file, config.MAX_UPLOAD_SIZE_MB);
    if (!validation.valid) {
      const err = new Error(validation.error || 'Invalid resume file');
      err.status = 400;
      err.code = 'INVALID_FILE';
      throw err;
    }

    const safeFilename = sanitizeFilename(file.originalname);
    let extractedText = '';

    // 2. Text Extraction based on verified fileType
    if (validation.fileType === 'pdf') {
      extractedText = await extractTextFromPDF(file.buffer);
    } else if (validation.fileType === 'docx') {
      extractedText = await extractTextFromDOCX(file.buffer);
    } else if (validation.fileType === 'txt') {
      extractedText = file.buffer.toString('utf-8');
    }

    if (!extractedText || !extractedText.trim()) {
      const err = new Error('No readable text content found in file');
      err.status = 400;
      err.code = 'EMPTY_FILE_CONTENT';
      throw err;
    }

    // 3. Structured parsing
    const parsedData = await parseResume(extractedText);

    // 4. Compute embedding
    let resumeEmbedding = null;
    try {
      const embeddingText = [
        parsedData.summary || '',
        parsedData.skills.join(' '),
        (parsedData.experience || []).slice(0, 3).join(' ')
      ].join(' ').trim();

      if (embeddingText) {
        resumeEmbedding = await embed(embeddingText);
      }
    } catch (embedErr) {
      logger.warn('Could not generate embedding for uploaded resume', { error: embedErr.message });
    }

    // 5. Persist to PostgreSQL Resume table (no temporary files stored on disk!)
    const savedResume = await resumeRepository.create({
      userId,
      filename: safeFilename,
      fileSize: file.buffer.length,
      mimeType: file.mimetype || 'application/octet-stream',
      rawText: extractedText,
      parsedData,
      skills: parsedData.skills || [],
      embedding: resumeEmbedding,
    });

    // 6. Update user's portfolio automatically with latest parsed skills
    try {
      const user = await userRepository.findById(userId);
      const existingPortfolio = (user?.portfolio && typeof user.portfolio === 'object') ? user.portfolio : {};
      await userRepository.updatePortfolio(userId, {
        ...existingPortfolio,
        skills: parsedData.skills || [],
        education: parsedData.education || [],
        experience: parsedData.experience || [],
        contact: parsedData.personal || {},
        lastResumeUpdatedAt: new Date().toISOString()
      });
    } catch (portErr) {
      logger.warn('Failed to auto-update portfolio with resume data', { error: portErr.message });
    }

    return {
      resumeId: savedResume.id,
      filename: safeFilename,
      fileSize: `${(file.buffer.length / 1024).toFixed(2)} KB`,
      extractedTextLength: extractedText.length,
      extractedText,
      data: parsedData,
    };
  },

  getLatestResume: async (userId) => {
    const resume = await resumeRepository.findLatestByUserId(userId);
    if (!resume) {
      return null;
    }
    return {
      id: resume.id,
      filename: resume.filename,
      fileSize: resume.fileSize,
      parsedData: resume.parsedData,
      skills: resume.skills,
      createdAt: resume.createdAt,
    };
  }
};

export default resumeService;
