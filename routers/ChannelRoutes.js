import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  createChannel,
  getChannel,
  getChannelMessage,
} from "../controllers/ChannelController.js";

const ChannelRoutes = Router();

ChannelRoutes.post("/createChannel", verifyToken, createChannel);
ChannelRoutes.get("/getChannel", verifyToken, getChannel);
ChannelRoutes.get(
  "/getChannelMessage/:channelId",
  verifyToken,
  getChannelMessage
);

export default ChannelRoutes;
