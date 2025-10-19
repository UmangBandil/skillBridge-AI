import express from "express";
import { PrismaClient } from "@prisma/client";
import { embed, rankTasks } from "../ml/matcher.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (_req, res) => {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  res.json(tasks);
});

router.post("/recruiter", async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: "Missing task" });
  }

  const embedding = await embed(task);
  const newTask = await prisma.task.create({
    data: {
      title: task,
      description: task,
      skills: [],
      budget: 0,
      embedding,
    },
  });

  res.status(201).json(newTask);
});

router.post("/match", async (req, res) => {
  const { resume } = req.body;
  if (!resume || typeof resume !== "string") return res.status(400).json({ error: "resume required" });
  const tasks = await prisma.task.findMany();
  const ranked = await rankTasks(resume, tasks);
  res.json(ranked);
});


export default router;