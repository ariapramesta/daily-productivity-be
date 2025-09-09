import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createTag, getTags, deleteTag } from "../controllers/tagController.js";

const router = express.Router();

router.post("/", verifyToken, createTag);
router.get("/", verifyToken, getTags);
router.delete("/:id", verifyToken, deleteTag);

export default router;
