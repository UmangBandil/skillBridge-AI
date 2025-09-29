import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tasks
router.get("/", async (_req, res) => {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  res.json(tasks);
});

// POST /api/tasks
router.post("/", async (req, res) => {
  const { title, description, skills, budget } = req.body;
  if (!title || !description || !Array.isArray(skills) || typeof budget !== "number") {
    return res.status(400).json({ error: "Missing/invalid fields" });
  }
  const task = await prisma.task.create({
    data: { title, description, skills, budget },
  });
  res.status(201).json(task);
});

export default router;
