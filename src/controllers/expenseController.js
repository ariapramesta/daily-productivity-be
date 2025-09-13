import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient

// Get all expenses
export const getExpenses = async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            where: { userId: req.user.id },
            include: { items: true },
        });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single expense
export const getExpenseById = async (req, res) => {
    try {
        const expense = await prisma.expense.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id,
            },
            include: { items: true },
        });
        if (!expense) return res.status(404).json({ error: "Expense not found" });
        res.json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create expense
export const createExpense = async (req, res) => {
    try {
        const { title, amount } = req.body;
        const expense = await prisma.expense.create({
            data: {
                title,
                amount,
                remaining: amount,
                userId: req.user.id
            },
        });
        res.json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update expense
export const updateExpense = async (req, res) => {
    try {
        const { title, amount } = req.body;
        const expense = await prisma.expense.update({
            where: { id: req.params.id },
            data: { title, amount },
        });
        res.json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete expense
export const deleteExpense = async (req, res) => {
    try {
        await prisma.expense.delete({ where: { id: req.params.id } });
        res.json({ message: "Expense deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
