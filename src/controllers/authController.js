import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

// REGISTER
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });
        res.json({ message: "User registered", user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "Invalid password" });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // simpan refreshToken di DB
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        // simpan refreshToken di cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // set true kalau https
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
        });

        res.json({
            message: "Login successful",
            accessToken,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// REFRESH
export const refresh = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ error: "No refresh token" });

        const user = await prisma.user.findFirst({ where: { refreshToken: token } });
        if (!user) return res.status(403).json({ error: "Invalid refresh token" });

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err) => {
            if (err) return res.status(403).json({ error: "Invalid token" });

            const accessToken = generateAccessToken(user);
            res.json({ accessToken });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGOUT
export const logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.sendStatus(204); // no content

        await prisma.user.updateMany({
            where: { refreshToken: token },
            data: { refreshToken: null },
        });

        res.clearCookie("refreshToken");
        res.json({ message: "Logout successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
