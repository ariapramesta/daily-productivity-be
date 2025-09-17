import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createTag, getTags, deleteTag } from "../controllers/tagController.js";

const router = express.Router();

router.post("/", authMiddleware, createTag);
router.get("/", authMiddleware, getTags);
router.delete("/:id", authMiddleware, deleteTag);

export default router;
