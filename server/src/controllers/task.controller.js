import taskService from '../services/task.service.js';
import taskRepository from '../repositories/task.repository.js';
import { parseResume } from '../ml/resume-parser.js';
import { matchAndRankTasks } from '../ml/matcher.service.js';

export const taskController = {
  getTasks: async (req, res, next) => {
    try {
      const result = await taskService.getTasks(req.query);
      
      // If legacy requested (e.g. old /api/tasks route without page param),
      // we can return the items array directly to avoid breaking old clients,
      // while providing headers for pagination.
      if (req.isLegacyRoute) {
        return res.json(result.items);
      }

      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  getTaskById: async (req, res, next) => {
    try {
      const task = await taskService.getTaskById(req.params.id);
      if (req.isLegacyRoute) {
        return res.json(task);
      }
      res.json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  },

  createTask: async (req, res, next) => {
    try {
      const task = await taskService.createTask({
        ...req.body,
        authorId: req.user.userId
      });

      if (req.isLegacyRoute) {
        return res.status(201).json(task);
      }

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  },

  updateTask: async (req, res, next) => {
    try {
      const updated = await taskService.updateTask(req.params.id, req.body, req.user.userId);
      if (req.isLegacyRoute) {
        return res.json(updated);
      }
      res.json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  deleteTask: async (req, res, next) => {
    try {
      await taskService.deleteTask(req.params.id, req.user.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  matchTasks: async (req, res, next) => {
    try {
      const { resume, resumeText } = req.body;
      const textToMatch = resume || resumeText;

      if (!textToMatch || typeof textToMatch !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_RESUME',
            message: 'Resume text or structure is required for matching'
          }
        });
      }

      const parsedResume = await parseResume(textToMatch);
      const openTasks = await taskRepository.findManyPaginated({ status: 'open', limit: 100 });
      const rankedMatches = await matchAndRankTasks(parsedResume, openTasks.items);

      if (req.isLegacyRoute) {
        return res.json(rankedMatches);
      }

      res.json({
        success: true,
        data: {
          matches: rankedMatches,
          totalMatches: rankedMatches.length,
          parsedResume
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

export default taskController;
