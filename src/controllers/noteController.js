import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient

// Create note
export const createNote = async (req, res) => {
    const { title, content } = req.body;
    try {
        const note = await prisma.note.create({
            data: {
                title,
                content,
                userId: req.user.id
            }
        });
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all notes for logged-in user
export const getNotes = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", sort = "updatedAt", order = "desc" } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {
            userId: req.user.id,
            OR: search
                ? [
                    { title: { contains: search, mode: "insensitive" } },
                    { content: { contains: search, mode: "insensitive" } },
                ]
                : undefined,
        };

        // hitung total data
        const total = await prisma.note.count({ where });

        // ambil data sesuai pagination
        const notes = await prisma.note.findMany({
            where,
            skip,
            take,
            orderBy: {
                [sort]: order,
            },
        });

        res.json({
            data: {
                notes,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / take),
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Get single note
export const getNote = async (req, res) => {
    try {
        const note = await prisma.note.findFirst({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update note
export const updateNote = async (req, res) => {
    const { title, content } = req.body;
    try {
        const note = await prisma.note.updateMany({
            where: { id: req.params.id, userId: req.user.id },
            data: { title, content }
        });
        if (note.count === 0) return res.status(404).json({ message: "Note not found or not yours" });
        res.json({
            message: "Note updated",
            note: {
                id: note.id,
                title: note.title,
                content: note.content,
                updatedAt: note.updatedAt,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete note
export const deleteNote = async (req, res) => {
    try {
        const note = await prisma.note.delete({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (note.count === 0) return res.status(404).json({ message: "Note not found or not yours" });
        res.json({
            message: "Note deleted",
            note: {
                id: note.id,
                title: note.title,
                content: note.content,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
