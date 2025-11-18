import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes.js";
import authRoutes from "./routes/auth.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";

const app = express();

// The web server is running on port 5173, so we need to allow requests from it
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// The vite proxy is configured to send requests to /api to the backend
// so we don't need to include /api in the routes here
app.use("/tasks", taskRoutes);
app.use("/auth", authRoutes);
app.use("/portfolio", portfolioRoutes);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
