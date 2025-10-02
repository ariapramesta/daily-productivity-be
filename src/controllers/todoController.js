import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient

export const createTodo = async (req, res) => {
    const { title, deadline, tags, items } = req.body;
    try {
        const todo = await prisma.todo.create({
            data: {
                title,
                deadline: deadline ? new Date(deadline) : null,
                userId: req.user.id,
                tags: {
                    connect: (tags || []).map((id) => ({ id }))
                },
                items: {
                    create: (items || []).map((i) => ({
                        content: i.content,
                        done: !!i.done
                    }))
                }
            },
            include: { tags: true, items: true }
        });
        res.status(201).json({ message: "Todo created", todo });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const getTodos = async (req, res) => {
    try {
        const {
            search = "",
            page = 1,
            limit = 10,
            sort = "desc"
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {
            userId: req.user.id,
            ...(search && {
                title: { contains: search, mode: "insensitive" }
            })
        };

        const todos = await prisma.todo.findMany({
            where,
            skip,
            take,
            orderBy: [
                { updatedAt: sort.toLowerCase() === "asc" ? "asc" : "desc" }
            ],
            include: { tags: true, items: true }
        });

        const total = await prisma.todo.count({ where });
        const totalPages = Math.ceil(total / take);

        res.json({
            data: {
                todos,
                total,
                page: parseInt(page),
                limit: take,
                totalPages
            }

        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


export const getTodo = async (req, res) => {
    try {
        const todo = await prisma.todo.findFirst({
            where: { id: req.params.id, userId: req.user.id },
            include: { tags: true, items: true }
        });
        if (!todo) return res.status(404).json({ message: "Todo not found" });
        res.json(todo);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const updateTodo = async (req, res) => {
    const { title, deadline, tags } = req.body;
    const id = req.params.id;
    try {
        const owned = await prisma.todo.findFirst({ where: { id, userId: req.user.id } });
        if (!owned) return res.status(404).json({ message: "Todo not found or not yours" });

        const updated = await prisma.todo.update({
            where: { id },
            data: {
                ...(title !== undefined ? { title } : {}),
                ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
                ...(tags
                    ? {
                        tags: {
                            set: [],
                            connectOrCreate: tags.map((t) => ({
                                where: { name: t },
                                create: { name: t }
                            }))
                        }
                    }
                    : {})
            },
            include: { tags: true, items: true }
        });
        res.json({ message: "Todo updated", todo: updated });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const deleteTodo = async (req, res) => {
    const id = req.params.id;
    try {
        const owned = await prisma.todo.findFirst({ where: { id, userId: req.user.id } });
        if (!owned) return res.status(404).json({ message: "Todo not found or not yours" });

        await prisma.todo.delete({ where: { id } });
        res.json({ message: "Todo deleted" });
    } catch (e) { res.status(500).json({ error: e.message }); }
};
