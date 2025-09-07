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
        const notes = await prisma.note.findMany({
            where: { userId: req.user.id }
        });
        res.json(notes);
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
        const note = await prisma.note.update({
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
