import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient

export const addTodoItem = async (req, res) => {
    const { content } = req.body;
    const todoId = req.params.todoId;
    try {
        const todo = await prisma.todo.findFirst({ where: { id: todoId, userId: req.user.id } });
        if (!todo) return res.status(404).json({ message: "Todo not found or not yours" });

        const item = await prisma.todoItem.create({
            data: { content, todoId }
        });
        res.status(201).json({ message: "Item added", item });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const updateTodoItem = async (req, res) => {
    const { content, done } = req.body;
    try {
        const item = await prisma.todoItem.update({
            where: { id: req.params.itemId },
            data: {
                content,
                done
            }
        });
        res.json({ message: "Todo item updated", item });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteTodoItem = async (req, res) => {
    try {
        await prisma.todoItem.delete({
            where: { id: req.params.itemId }
        });
        res.json({ message: "Todo item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
