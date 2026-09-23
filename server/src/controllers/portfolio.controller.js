import portfolioService from '../services/portfolio.service.js';

export const portfolioController = {
  getPortfolio: async (req, res, next) => {
    try {
      const result = await portfolioService.getPortfolio(req.user.userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  updatePortfolio: async (req, res, next) => {
    try {
      const { portfolio } = req.body;
      if (portfolio === undefined) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PORTFOLIO',
            message: 'Portfolio data is required'
          }
        });
      }

      let dataToSave = portfolio;
      if (typeof portfolio === 'string') {
        try {
          dataToSave = JSON.parse(portfolio);
        } catch {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_JSON',
              message: 'Portfolio string must be valid JSON'
            }
          });
        }
      }

      const updated = await portfolioService.updatePortfolio(req.user.userId, dataToSave);
      res.json({
        success: true,
        portfolio: updated.portfolio,
        message: 'Portfolio saved successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

export default portfolioController;
