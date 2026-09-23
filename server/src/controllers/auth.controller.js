import authService from '../services/auth.service.js';

export const authController = {
  signup: async (req, res, next) => {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  signin: async (req, res, next) => {
    try {
      const result = await authService.signin(req.body);
      res.json({
        success: true,
        // Legacy top-level token and role support for backward compatibility with frontend
        token: result.token,
        role: result.role,
        user: result.user,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  me: async (req, res) => {
    res.json({
      success: true,
      data: req.user
    });
  }
};

export default authController;
