import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true }
        });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
