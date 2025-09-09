import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { addTodoItem, updateTodoItem, deleteTodoItem } from "../controllers/todoItemController.js";

const router = express.Router({ mergeParams: true });

// POST /todos/:todoId/items
router.post("/", verifyToken, addTodoItem);

// PUT /todos/:todoId/items/:itemId
router.put("/:itemId", verifyToken, updateTodoItem);

// DELETE /todos/:todoId/items/:itemId
router.delete("/:itemId", verifyToken, deleteTodoItem);

export default router;
