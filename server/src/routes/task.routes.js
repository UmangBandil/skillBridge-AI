import express from "express";
import { PrismaClient } from "@prisma/client";
import { embed, rankTasks } from "../ml/matcher.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (_req, res) => {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/recruiter", protect, async (req, res) => {
  try {
    const { title, description, skills, budget } = req.body;
    if (!title || !description || !skills || !budget) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const embedding = await embed(`${description} ${skills.join(" ")}`);
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        skills,
        budget,
        embedding,
        authorId: req.user.userId,
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/match", protect, async (req, res) => {
  try {
    const { resume } = req.body;
    if (!resume || typeof resume !== "string") return res.status(400).json({ error: "resume required" });
    const tasks = await prisma.task.findMany();
    const ranked = await rankTasks(resume, tasks);
    res.json(ranked);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;