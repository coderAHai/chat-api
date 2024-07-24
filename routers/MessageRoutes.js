import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getMessages, uploadFile } from "../controllers/MessageController.js";
import multer from "multer";

const messageRoutes = Router();
const upload = multer({ dest: "uploads/files" });

messageRoutes.post("/getMessage", verifyToken, getMessages);
messageRoutes.post(
  "/uploadFile",
  verifyToken,
  upload.single("file"),
  uploadFile
);

export default messageRoutes;