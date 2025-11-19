import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

// Register
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Simpan refresh token ke DB
    await prisma.user.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });

    // Set refreshToken ke cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Ganti true ketika pakai HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    // Ambil data user tanpa password & refreshToken
    const user = await prisma.user.findUnique({
      where: { id: newUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Response final
    return res.status(201).json({
      message: "User registered successfully",
      user,
      accessToken,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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

    // simpan refresh token di DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // set cookie refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // buang password dan refreshToken sebelum return
    const { password: _pw, refreshToken: _rt, ...safeUser } = user;

    // kirim hanya access token + user aman
    res.json({
      message: "Login successful",
      user: safeUser,
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Refresh token
export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  const user = await prisma.user.findFirst({ where: { refreshToken } });
  if (!user) return res.status(403).json({ message: "Invalid refresh token" });

  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = generateAccessToken(user);

    return res.json({ accessToken: newAccessToken });
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
