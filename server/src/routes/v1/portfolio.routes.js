import { Router } from 'express';
import portfolioController from '../../controllers/portfolio.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', protect, portfolioController.getPortfolio);
router.put('/', protect, portfolioController.updatePortfolio);

export default router;
