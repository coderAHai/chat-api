import Message from "../models/MessageModel.js";
import { mkdirSync, renameSync } from "fs";

// 发送消息
export const getMessages = async (request, response, next) => {
  try {
    const sender = request.userId;
    const recipient = request.body.id;

    if (!sender || !recipient) {
      return response.status(400).send("Both User ID are required.");
    }

    const message = await Message.find({
      $or: [
        { sender: sender, recipient: recipient },
        { sender: recipient, recipient: sender },
      ],
    }).sort({ timestamp: 1 });

    return response.status(200).json(message);
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

// 发送文件
export const uploadFile = async (request, response, next) => {
  try {
    if (!request.file) {
      return response.status(400).send("File is required.");
    }
    const { userId } = request;
    const date = Date.now();
    const suffix = request.file.originalname.split(".").pop();
    const fileDir = `uploads/files/${userId}`;
    const fileName = `${fileDir}/${date}.${suffix}`;

    mkdirSync(fileDir, { recursive: true });
    renameSync(request.file.path, fileName);

    return response.status(200).json({ fileUrl: fileName });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};
