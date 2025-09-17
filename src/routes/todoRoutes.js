import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createTodo, getTodos, getTodo, updateTodo, deleteTodo } from "../controllers/todoController.js";
import todoItemRoutes from "./todoItemRoutes.js";

const router = express.Router();

router.post("/", authMiddleware, createTodo);
router.get("/", authMiddleware, getTodos);
router.get("/:id", authMiddleware, getTodo);
router.put("/:id", authMiddleware, updateTodo);
router.delete("/:id", authMiddleware, deleteTodo);

router.use("/:todoId/items", todoItemRoutes);

export default router;


