import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedName = String(name).trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (normalizedName.length < 2) {
      return res.status(400).json({ error: "Invalid name" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: normalizedName,
      },
    });

    // Do not return password hash
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    console.error(error);
    if (error?.code === "P2002") {
      return res.status(400).json({ error: "User already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Server misconfiguration" });
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;