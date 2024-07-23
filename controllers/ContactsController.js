import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Message from "../models/MessageModel.js";

// 搜索联系人
export const searchContacts = async (request, response, next) => {
  try {
    const { search } = request.body;
    const { userId } = request;
    if (search === undefined || search === null) {
      return response.status(400).send("search is required.");
    }
    const filterSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(filterSearch, "i");
    const contacts = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ userName: regex }, { email: regex }] },
      ],
    });
    return response.status(200).json(contacts);
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

// 获取联系人列表
export const getContactsList = async (request, response, next) => {
  try {
    let { userId } = request;
    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          userName: "$contactInfo.userName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return response.status(200).json(contacts);
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};
