import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient

// Create expense item + update remaining
export const createExpenseItem = async (req, res) => {
    const { name, cost } = req.body;
    const { expenseId } = req.params;

    try {
        const item = await prisma.$transaction(async (tx) => {
            const newItem = await tx.expenseItem.create({
                data: { name, cost, expenseId },
            });

            await tx.expense.update({
                where: { id: expenseId },
                data: { remaining: { decrement: cost } },
            });

            return newItem;
        });

        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update expense item + adjust remaining
export const updateExpenseItem = async (req, res) => {
    const { id } = req.params;
    const { name, cost } = req.body;

    try {
        const updatedItem = await prisma.$transaction(async (tx) => {
            // Ambil data item lama
            const oldItem = await tx.expenseItem.findUnique({
                where: { id },
            });

            if (!oldItem) {
                throw new Error("Expense item not found");
            }

            // Update item dengan data baru
            const newItem = await tx.expenseItem.update({
                where: { id },
                data: { name, cost },
            });

            // Hitung selisih cost
            const diff = cost - oldItem.cost;

            // Kalau ada perubahan cost, update remaining
            if (diff !== 0) {
                await tx.expense.update({
                    where: { id: oldItem.expenseId },
                    data: { remaining: { decrement: diff } },
                    // decrement: diff bisa negatif → otomatis jadi increment
                });
            }

            return newItem;
        });

        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Delete expense item + rollback remaining
export const deleteExpenseItem = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await prisma.$transaction(async (tx) => {
            const item = await tx.expenseItem.delete({ where: { id } });

            await tx.expense.update({
                where: { id: item.expenseId },
                data: { remaining: { increment: item.cost } },
            });

            return item;
        });

        res.json({ message: "Item deleted", deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
