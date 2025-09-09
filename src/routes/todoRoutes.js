import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createTodo, getTodos, getTodo, updateTodo, deleteTodo } from "../controllers/todoController.js";
import todoItemRoutes from "./todoItemRoutes.js";

const router = express.Router();

router.post("/", verifyToken, createTodo);
router.get("/", verifyToken, getTodos);
router.get("/:id", verifyToken, getTodo);
router.put("/:id", verifyToken, updateTodo);
router.delete("/:id", verifyToken, deleteTodo);

router.use("/:todoId/items", todoItemRoutes);

export default router;


