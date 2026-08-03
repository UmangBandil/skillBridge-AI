import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middleware/auth.middleware.js";
const router = Router();
const prisma = new PrismaClient();

// @route   GET /api/portfolio
// @desc    Get a user's portfolio
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const userId = req?.user?.userId ?? req?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { portfolio: true, name: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ portfolio: user.portfolio, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// @route   PUT /api/portfolio
// @desc    Save a user's portfolio
// @access  Private
router.put("/", protect, async (req, res) => {
  const { portfolio } = req.body;

  // Validate and normalize portfolio payload (accepts JSON object or JSON string)
  if (portfolio === undefined) {
    return res.status(400).json({ error: "portfolio is required" });
  }

  let portfolioData;
  if (typeof portfolio === "string") {
    try {
      portfolioData = JSON.parse(portfolio);
    } catch {
      return res.status(400).json({ error: "portfolio must be valid JSON" });
    }
  } else if (typeof portfolio === "object" && portfolio !== null) {
    portfolioData = portfolio;
  } else {
    return res.status(400).json({ error: "portfolio must be an object or JSON string" });
  }

  // Optional payload size guard (~100KB)
  const portfolioSize = Buffer.byteLength(JSON.stringify(portfolioData), "utf8");
  if (portfolioSize > 100_000) {
    return res.status(413).json({ error: "portfolio payload too large" });
  }

  try {
    const userId = req?.user?.userId ?? req?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { portfolio: portfolioData },
    });
    
    // Return only the necessary fields
    res.json({ 
      success: true,
      portfolio: user.portfolio,
      message: "Portfolio saved successfully" 
    });
  } catch (error) {
    console.error(error);
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;