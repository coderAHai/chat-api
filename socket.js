import { Server } from "socket.io";
import Message from "./models/MessageModel.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = (server) => {
  const userSocketMap = new Map();

  const io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    const createdMessage = await Message.create(message);
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email userName image color")
      .populate("recipient", "id email userName image color");
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("recieveMessage", messageData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("recieveMessage", messageData);
    }
  };

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;

    const createMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      fileUrl,
      timestamp: new Date(),
    });

    const messageData = await Message.findById(createMessage._id)
      .populate("sender", "id email userName image color")
      .exec();

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createMessage._id },
    });

    const channel = await Channel.findById(channelId).populate("members");
    const finalData = { ...messageData._doc, channel: channel };

    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("recieveChannelMessage", finalData);
        }
      });
      const adminSocketId = userSocketMap.get(channel.admin._id.toString());
      if (adminSocketId) {
        io.to(adminSocketId).emit("recieveChannelMessage", finalData);
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log("User ID not proveided during connection.");
    }

    // 发送消息
    socket.on("sendMessage", sendMessage);
    // 发送频道消息
    socket.on("sendChannelMeesage", sendChannelMessage);
    // 断开链接
    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
