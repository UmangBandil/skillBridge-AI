import applicationService from '../services/application.service.js';

export const applicationController = {
  apply: async (req, res, next) => {
    try {
      const { taskId, coverLetter } = req.body;
      const application = await applicationService.apply({
        userId: req.user.userId,
        taskId,
        coverLetter
      });

      res.status(201).json({
        success: true,
        data: application
      });
    } catch (err) {
      next(err);
    }
  },

  withdraw: async (req, res, next) => {
    try {
      const result = await applicationService.withdraw(req.params.id, req.user.userId);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  getMyApplications: async (req, res, next) => {
    try {
      const applications = await applicationService.getStudentApplications(req.user.userId);
      res.json({
        success: true,
        data: applications
      });
    } catch (err) {
      next(err);
    }
  },

  getRecruiterApplications: async (req, res, next) => {
    try {
      const applications = await applicationService.getRecruiterApplications(req.user.userId);
      res.json({
        success: true,
        data: applications
      });
    } catch (err) {
      next(err);
    }
  },

  getTaskApplications: async (req, res, next) => {
    try {
      const applications = await applicationService.getTaskApplications(req.params.taskId, req.user.userId);
      res.json({
        success: true,
        data: applications
      });
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      const updated = await applicationService.updateStatus({
        applicationId: req.params.id,
        status,
        recruiterId: req.user.userId
      });

      res.json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
};

export default applicationController;
