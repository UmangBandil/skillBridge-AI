import applicationRepository from '../repositories/application.repository.js';
import taskRepository from '../repositories/task.repository.js';

export const applicationService = {
  apply: async ({ userId, taskId, coverLetter }) => {
    // 1. Verify task existence and status
    const task = await taskRepository.findById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.status = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    if (task.status !== 'open') {
      const err = new Error('This opportunity is no longer accepting applications');
      err.status = 400;
      err.code = 'TASK_CLOSED';
      throw err;
    }

    // 2. Prevent author applying to own task
    if (task.authorId === userId) {
      const err = new Error('You cannot apply to your own internship opportunity');
      err.status = 400;
      err.code = 'CANNOT_APPLY_TO_OWN_TASK';
      throw err;
    }

    // 3. Prevent duplicate applications
    const existing = await applicationRepository.findByUserAndTask(userId, taskId);
    if (existing) {
      const err = new Error('You have already applied to this opportunity');
      err.status = 409;
      err.code = 'APPLICATION_ALREADY_EXISTS';
      throw err;
    }

    return applicationRepository.create({ userId, taskId, coverLetter });
  },

  withdraw: async (applicationId, userId) => {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const err = new Error('Application not found');
      err.status = 404;
      err.code = 'APPLICATION_NOT_FOUND';
      throw err;
    }

    if (application.userId !== userId) {
      const err = new Error('You are not authorized to withdraw this application');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    if (application.status === 'WITHDRAWN') {
      const err = new Error('Application has already been withdrawn');
      err.status = 400;
      err.code = 'ALREADY_WITHDRAWN';
      throw err;
    }

    return applicationRepository.updateStatus(applicationId, 'WITHDRAWN');
  },

  getStudentApplications: async (userId) => {
    return applicationRepository.findByUserId(userId);
  },

  getRecruiterApplications: async (recruiterId) => {
    return applicationRepository.findByRecruiterId(recruiterId);
  },

  getTaskApplications: async (taskId, recruiterId) => {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.status = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    if (task.authorId !== recruiterId) {
      const err = new Error('You are not authorized to view applications for this task');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    return applicationRepository.findByTaskId(taskId);
  },

  updateStatus: async ({ applicationId, status, recruiterId }) => {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const err = new Error('Application not found');
      err.status = 404;
      err.code = 'APPLICATION_NOT_FOUND';
      throw err;
    }

    if (application.task.authorId !== recruiterId) {
      const err = new Error('You are not authorized to manage applications for this task');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    return applicationRepository.updateStatus(applicationId, status);
  }
};

export default applicationService;
