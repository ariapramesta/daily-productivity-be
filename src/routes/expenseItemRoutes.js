import express from "express";
import {
    createExpenseItem,
    updateExpenseItem,
    deleteExpenseItem,
} from "../controllers/expenseItemController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:expenseId", authMiddleware, createExpenseItem);
router.put("/:expenseId/:id", authMiddleware, updateExpenseItem);
router.delete("/:id", authMiddleware, deleteExpenseItem);

export default router;
