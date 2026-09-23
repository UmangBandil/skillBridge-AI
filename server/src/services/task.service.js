import taskRepository from '../repositories/task.repository.js';
import { embed } from '../ml/embedding.service.js';
import logger from '../utils/logger.js';

function formatTaskSkills(task) {
  if (!task) return null;
  return {
    ...task,
    skills: Array.isArray(task.skills)
      ? task.skills
      : (typeof task.skills === 'string' ? task.skills.split(',').map(s => s.trim()).filter(Boolean) : [])
  };
}

export const taskService = {
  getTasks: async (queryParams) => {
    const result = await taskRepository.findManyPaginated(queryParams);
    return {
      ...result,
      items: result.items.map(formatTaskSkills)
    };
  },

  getTaskById: async (id) => {
    const task = await taskRepository.findById(id);
    if (!task) {
      const err = new Error('Task not found');
      err.status = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }
    return formatTaskSkills(task);
  },

  createTask: async ({ title, description, skills, budget, authorId }) => {
    const normalizedSkills = [...new Set(skills.map(s => s.trim()).filter(Boolean))];
    const skillsStr = normalizedSkills.join(',');

    // Generate embedding for semantic matching
    let embedding = null;
    try {
      const embeddingText = `${title} ${description} ${normalizedSkills.join(' ')}`.trim();
      embedding = await embed(embeddingText);
    } catch (err) {
      logger.warn('Could not generate embedding for new task; proceeding without vector', { error: err.message });
    }

    const newTask = await taskRepository.create({
      title,
      description,
      skills: skillsStr,
      budget,
      authorId,
      embedding
    });

    return formatTaskSkills(newTask);
  },

  updateTask: async (id, data, currentUserId) => {
    const existing = await taskRepository.findById(id);
    if (!existing) {
      const err = new Error('Task not found');
      err.status = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    if (existing.authorId !== currentUserId) {
      const err = new Error('You are not authorized to modify this task');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    const updateData = { ...data };

    // If skills array was provided, serialize to comma-separated string
    let skillsStr = existing.skills;
    if (data.skills && Array.isArray(data.skills)) {
      const normalizedSkills = [...new Set(data.skills.map(s => s.trim()).filter(Boolean))];
      skillsStr = normalizedSkills.join(',');
      updateData.skills = skillsStr;
    }

    // If content changed, regenerate embedding
    const contentChanged = (data.title && data.title !== existing.title) ||
                           (data.description && data.description !== existing.description) ||
                           (data.skills && skillsStr !== existing.skills);

    if (contentChanged) {
      try {
        const titleToUse = data.title || existing.title;
        const descToUse = data.description || existing.description;
        const textToEmbed = `${titleToUse} ${descToUse} ${skillsStr}`.trim();
        updateData.embedding = await embed(textToEmbed);
      } catch (err) {
        logger.warn('Failed to regenerate task embedding on update', { error: err.message });
      }
    }

    const updated = await taskRepository.update(id, updateData);
    return formatTaskSkills(updated);
  },

  deleteTask: async (id, currentUserId) => {
    const existing = await taskRepository.findById(id);
    if (!existing) {
      const err = new Error('Task not found');
      err.status = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    if (existing.authorId !== currentUserId) {
      const err = new Error('You are not authorized to delete this task');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    await taskRepository.delete(id);
    return true;
  }
};

export default taskService;
