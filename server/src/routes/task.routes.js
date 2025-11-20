import express from "express";
import { PrismaClient } from "@prisma/client";
import { embed, rankTasks } from "../ml/matcher.js";
import { protect } from "../middleware/auth.middleware.js";
import { parseResume } from "../ml/parser.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    // Pagination support (defaults: page=1, pageSize=20, max pageSize=100)
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
    const pageSizeRaw = parseInt(req.query.pageSize ?? "20", 10);
    const pageSize = Math.min(100, Math.max(1, Number.isNaN(pageSizeRaw) ? 20 : pageSizeRaw));
    const skip = (page - 1) * pageSize;

    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    res.json(
      tasks.map((t) => ({
        ...t,
        skills: t.skills.split(",").map((s) => s.trim()).filter(Boolean),
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    if (!taskId || typeof taskId !== "string") {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({
      ...task,
      skills: task.skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    console.log('Task creation request received:', {
      body: req.body,
      userId: req.user?.userId
    });
    
    const { title, description, skills, budget } = req.body;
    
    // Trim and validate fields
    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    const trimmedDescription = typeof description === 'string' ? description.trim() : '';
    
    console.log('Validated fields:', { trimmedTitle, trimmedDescription, skills, budget });
    
    if (!trimmedTitle || !trimmedDescription || skills == null || budget == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!Array.isArray(skills) || skills.length === 0 || !skills.every((s) => typeof s === "string")) {
      return res.status(400).json({ error: "Skills must be a non-empty array of strings" });
    }

    const normalizedSkills = [...new Set(skills.map((s) => s.trim()).filter(Boolean))];
    if (normalizedSkills.length === 0) {
      return res.status(400).json({ error: "Skills cannot be empty after normalization" });
    }
    const skillsStr = normalizedSkills.join(",");

    const budgetNum = Number(budget);
    if (!Number.isFinite(budgetNum) || budgetNum < 0) {
      return res.status(400).json({ error: "Budget must be a non-negative number" });
    }

    // Create embedding text and ensure it's not empty
    const embeddingText = `${trimmedTitle} ${trimmedDescription} ${normalizedSkills.join(" ")}`.trim();
    if (!embeddingText) {
      return res.status(400).json({ error: "Task content cannot be empty" });
    }

    // Try to generate embedding, but don't fail if it doesn't work
    let embedding = null;
    try {
      console.log('Generating embedding for task...');
      embedding = await embed(embeddingText);
      console.log('Embedding generated successfully');
    } catch (embedError) {
      console.error('Error generating embedding:', embedError);
      // Continue without embedding - task can still be created
      // The embedding can be generated later if needed
      console.warn('Creating task without embedding');
    }

    const newTask = await prisma.task.create({
      data: {
        title: trimmedTitle,
        description: trimmedDescription,
        skills: skillsStr,
        budget: budgetNum,
        embedding,
        authorId: req.user.userId,
      },
    });

    res.status(201).json({ ...newTask, skills: normalizedSkills });
  } catch (error) {
    console.error('Error creating task:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Provide more specific error messages
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "A task with this information already exists" });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: "Invalid user reference" });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const taskId = req.params.id;
    if (!taskId || typeof taskId !== "string") {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const { status } = req.body;
    if (typeof status !== "string" || !status.trim()) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    // Handle Prisma record not found
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const taskId = req.params.id;
    if (!taskId || typeof taskId !== "string") {
      return res.status(400).json({ error: "Invalid task id" });
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/match", protect, async (req, res) => {
  try {
    const { resume } = req.body;
    if (!resume || typeof resume !== "string") {
      return res.status(400).json({ error: "resume required" });
    }
    const parsedResume = parseResume(resume);
    const tasks = await prisma.task.findMany({
      where: { status: "open" }, // Only match open tasks
    });
    const ranked = await rankTasks(parsedResume, tasks);
    
    // Format response with skills as arrays
    const formattedResults = ranked.map((task) => ({
      ...task,
      skills: typeof task.skills === 'string' 
        ? task.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : task.skills,
      embedding: undefined, // Don't send embeddings to frontend
    }));
    
    res.json(formattedResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;