import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middleware/auth.middleware.js";
const router = Router();
const prisma = new PrismaClient();

// @route   PUT /api/portfolio
// @desc    Save a user's portfolio
// @access  Private
router.put("/", protect, async (req, res) => {
  const { portfolio } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { portfolio },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;