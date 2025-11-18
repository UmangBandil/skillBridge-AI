import express from "express";
import { PrismaClient } from "@prisma/client";
import { embed, rankTasks } from "../ml/matcher.js";
import { protect } from "../middleware/auth.middleware.js";
import { parseResume } from "../ml/parser.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (_req, res) => {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
    res.json(tasks.map(t => ({...t, skills: t.skills.split(",") })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({...task, skills: task.skills.split(",")});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { title, description, skills, budget } = req.body;
    if (!title || !description || !skills || !budget) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const skillsStr = skills.join(",");

    const embedding = await embed(`${description} ${skills.join(" ")}`);
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        skills: skillsStr,
        budget,
        embedding,
        authorId: req.user.userId,
      },
    });

    res.status(201).json({ ...newTask, skills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    await prisma.task.delete({ where: { id: taskId } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/match", protect, async (req, res) => {
  try {
    const { resume } = req.body;
    if (!resume || typeof resume !== "string") return res.status(400).json({ error: "resume required" });
    const parsedResume = parseResume(resume);
    const tasks = await prisma.task.findMany();
    const ranked = await rankTasks(parsedResume, tasks);
    res.json(ranked);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;