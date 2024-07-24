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
