import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js"
import todoRoutes from "./routes/todoRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import expenseItemRoutes from "./routes/expenseItemRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser())

// routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/notes", noteRoutes);
app.use("/todos", todoRoutes);
app.use("/tags", tagRoutes);
app.use("/expenses", expenseRoutes);
app.use("/expense-items", expenseItemRoutes);

app.get("/", (req, res) => {
    res.json({ message: "API running..." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
