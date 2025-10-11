import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import taskRoutes from "./routes/task.routes.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.get("/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));
app.use("/api/tasks", taskRoutes);
app.listen(PORT, () => console.log(`🚀 API on http://localhost:${PORT}`));