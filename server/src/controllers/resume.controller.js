import resumeService from '../services/resume.service.js';
import { parseResume } from '../ml/resume-parser.js';

export const resumeController = {
  uploadResume: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_PROVIDED',
            message: 'Please provide a resume file (.pdf, .txt, or .docx)'
          }
        });
      }

      const result = await resumeService.processUpload(req.file, req.user.userId);
      res.json({
        success: true,
        data: result,
        // Legacy top-level fields for existing frontend compatibility
        filename: result.filename,
        fileSize: result.fileSize,
        extractedTextLength: result.extractedTextLength,
        extractedText: result.extractedText,
      });
    } catch (err) {
      next(err);
    }
  },

  parseText: async (req, res, next) => {
    try {
      const { resume, text } = req.body;
      const content = resume || text;
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMPTY_TEXT',
            message: 'Resume text is required'
          }
        });
      }

      const parsed = await parseResume(content);
      res.json({
        success: true,
        data: parsed
      });
    } catch (err) {
      next(err);
    }
  },

  getLatestResume: async (req, res, next) => {
    try {
      const resume = await resumeService.getLatestResume(req.user.userId);
      res.json({
        success: true,
        data: resume
      });
    } catch (err) {
      next(err);
    }
  }
};

export default resumeController;
