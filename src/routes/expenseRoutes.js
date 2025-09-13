import express from "express";
import {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
} from "../controllers/expenseController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getExpenses);
router.get("/:id", verifyToken, getExpenseById);
router.post("/", verifyToken, createExpense);
router.put("/:id", verifyToken, updateExpense);
router.delete("/:id", verifyToken, deleteExpense);

export default router;
