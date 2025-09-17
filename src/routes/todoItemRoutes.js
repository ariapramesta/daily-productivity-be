import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addTodoItem, updateTodoItem, deleteTodoItem } from "../controllers/todoItemController.js";

const router = express.Router({ mergeParams: true });

// POST /todos/:todoId/items
router.post("/", authMiddleware, addTodoItem);

// PUT /todos/:todoId/items/:itemId
router.put("/:itemId", authMiddleware, updateTodoItem);

// DELETE /todos/:todoId/items/:itemId
router.delete("/:itemId", authMiddleware, deleteTodoItem);

export default router;
