import userRepository from '../repositories/user.repository.js';

export const portfolioService = {
  getPortfolio: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    return {
      name: user.name,
      portfolio: user.portfolio
    };
  },

  updatePortfolio: async (userId, portfolioData) => {
    return userRepository.updatePortfolio(userId, portfolioData);
  }
};

export default portfolioService;
