import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";

export const createChannel = async (request, response, next) => {
  try {
    const { name, members } = request.body;
    const { userId } = request;
    const admin = await User.findById(userId);
    if (!admin) {
      return response.status(400).send("Admin User Not Found.");
    }
    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return response.status(400).send("Some Members Are Not valid Users.");
    }
    const channel = await Channel({
      name,
      members,
      admin: userId,
    });
    await channel.save();
    return response.status(201).json({ channel: channel });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const getChannel = async (request, response, next) => {
  try {
    const { userId } = request;
    const id = new mongoose.Types.ObjectId(userId);
    const channels = await Channel.find({
      $or: [{ admin: id }, { members: id }],
    })
      .populate("admin", "id email userName image color")
      .sort({ updateAt: -1 });

    return response.status(201).json({ channels });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const getChannelMessage = async (request, response, next) => {
  try {
    const { channelId } = request.params;
    console.log(channelId);
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
      },
    });
    if (!channel) {
      return response.status(404).send("Channel Not Found.");
    }
    const messages = channel.messages;
    return response.status(200).json({ messages });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};
