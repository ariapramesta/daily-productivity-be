import express from "express";
import { createNote, getNotes, getNote, updateNote, deleteNote } from "../controllers/noteController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createNote);
router.get("/", verifyToken, getNotes);
router.get("/:id", verifyToken, getNote);
router.put("/:id", verifyToken, updateNote);
router.delete("/:id", verifyToken, deleteNote);

export default router;
