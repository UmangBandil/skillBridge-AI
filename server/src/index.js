import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes.js";
import authRoutes from "./routes/auth.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Use env-driven CORS origin and allow credentials (needed for cookie-based auth)
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// The vite proxy is configured to send requests to /api to the backend
// so we don't need to include /api in the routes here
app.use("/tasks", taskRoutes);
app.use("/auth", authRoutes);
app.use("/portfolio", portfolioRoutes);

// Add a health check endpoint
app.get("/health", (req, res) => res.send("OK"));

// Use env-driven port with fallback
const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
