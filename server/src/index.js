import express from "express";
import cors from "cors";
import multer from "multer";
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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configure multer for file uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF and text files
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain' || file.originalname.toLowerCase().endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'), false);
    }
  }
});

// Make upload available to routes
app.locals.upload = upload;

// The vite proxy is configured to send requests to /api to the backend
// so we don't need to include /api in the routes here
app.use("/tasks", taskRoutes);
app.use("/auth", authRoutes);
app.use("/portfolio", portfolioRoutes);

// Add a health check endpoint
app.get("/health", (req, res) => res.send("OK"));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  if (err.message === 'Only PDF and TXT files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Use env-driven port with fallback.
// Note: some environments pre-set PORT=0 (meaning "pick a random port"),
// which breaks the vite proxy that expects the server on 4000. Treat falsy
// values as unset so we always bind to the configured port.
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
