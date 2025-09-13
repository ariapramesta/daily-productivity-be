import express from "express";
import {
    createExpenseItem,
    updateExpenseItem,
    deleteExpenseItem,
} from "../controllers/expenseItemController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/:expenseId", verifyToken, createExpenseItem);
router.put("/:expenseId/:id", verifyToken, updateExpenseItem);
router.delete("/:id", verifyToken, deleteExpenseItem);

export default router;
