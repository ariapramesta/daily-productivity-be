import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import expenseItemRoutes from "./routes/expenseItemRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // frontend
    credentials: true,
  })
);
app.use(morgan("dev"));

// routes
app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);
app.use("/todos", todoRoutes);
app.use("/tags", tagRoutes);
app.use("/expenses", expenseRoutes);
app.use("/expense-items", expenseItemRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API running..." });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
