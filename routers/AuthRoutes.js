import { Router } from "express";
import {
  addProfileImage,
  deleteProfileImage,
  getUserInfo,
  login,
  signup,
  updateProfile,
} from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const authRoutes = Router();
const upload = multer({ dest: "uploads/profiles/" });

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/userInfo", verifyToken, getUserInfo);
authRoutes.post("/updateProfile", verifyToken, updateProfile);
authRoutes.post(
  "/addProfileImage",
  verifyToken,
  upload.single("image"),
  addProfileImage
);
authRoutes.delete(
  "/deleteProfileImage",
  verifyToken,
  upload.single("image"),
  deleteProfileImage
);

export default authRoutes;
