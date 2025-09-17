import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

// Register
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // cek apakah email sudah terdaftar
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // buat user baru
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // generate token
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // simpan refresh token di DB
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        // simpan ke cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false, // true kalau https
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, // 15 menit
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
        });

        // response tanpa password
        const { password: _, ...safeUser } = user;
        res.status(201).json({ message: "User registered successfully", user: safeUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Login
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

        // simpan ke cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false, // true kalau https
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, // 15 menit
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
        });

        res.json({ message: "Login successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Refresh token
export const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const newAccessToken = generateAccessToken(user);

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.json({ message: "Token refreshed" });
    } catch (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

// Logout
export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await prisma.user.updateMany({
            where: { refreshToken },
            data: { refreshToken: null },
        });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
};

// Me
export const me = (req, res) => {
    res.json({ user: req.user });
};
