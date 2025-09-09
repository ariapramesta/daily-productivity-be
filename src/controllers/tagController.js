import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createTag = async (req, res) => {
    const { name } = req.body;
    try {
        const tag = await prisma.tag.create({ data: { name } });
        res.status(201).json(tag);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTags = async (req, res) => {
    try {
        const tags = await prisma.tag.findMany();
        res.json(tags);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteTag = async (req, res) => {
    try {
        const tag = await prisma.tag.findFirst({ where: { id: req.params.id } })
        await prisma.tag.delete({ where: { id: req.params.id } });
        res.json({
            message: "Tag deleted",
            tag
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
