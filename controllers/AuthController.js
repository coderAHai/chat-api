import User from "../models/UserModel.js";
import jwtPackage from "jsonwebtoken";
import bcryptPackage from "bcryptjs";
import { renameSync, unlinkSync } from "fs";

const maxAge = 7 * 24 * 60 * 60 * 1000;
const { sign } = jwtPackage;
const { compare } = bcryptPackage;

const createToken = (email, userId) => {
  return sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

// 注册
export const signup = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send("Email and Password is required.");
    }
    const user = await User.create({ email, password });
    response.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return response.status(201).json({
      id: user.id,
      email: user.email,
      profileSetup: user.profileSetup,
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

// 登录
export const login = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send("Email and Password is required.");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(404).send("User with the given email not found.");
    }
    const auth = await compare(password, user.password);
    if (!auth) {
      return response.status(400).send("Password is incorrect.");
    }
    response.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return response.status(200).json({
      id: user.id,
      email: user.email,
      profileSetup: user.profileSetup,
      userName: user.userName,
      image: user.image,
      color: user.color,
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

// 获取用户信息
export const getUserInfo = async (request, response, next) => {
  try {
    const user = await User.findById(request.userId);
    if (!user) {
      return response.status(404).send("User with the given email not found.");
    }
    return response.status(200).json({
      id: user.id,
      email: user.email,
      profileSetup: user.profileSetup,
      userName: user.userName,
      image: user.image,
      color: user.color,
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

// 更新用户信息
export const updateProfile = async (request, response, next) => {
  try {
    const { userId } = request;
    const { userName, color } = request.body;
    if (!userName) {
      return response.status(400).send("UserName and Color is required.");
    }
    const user = await User.findByIdAndUpdate(
      userId,
      {
        userName,
        color,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );
    return response.status(200).json({
      id: user.id,
      email: user.email,
      profileSetup: user.profileSetup,
      userName: user.userName,
      image: user.image,
      color: user.color,
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

// 更新用户头像
export const addProfileImage = async (request, response, next) => {
  try {
    if (!request.file) {
      return response.status(400).send("File is required.");
    }
    const date = Date.now();
    const fileName = "uploads/profiles/" + date + request.file.originalname;
    renameSync(request.file.path, fileName);
    const user = await User.findByIdAndUpdate(
      request.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );
    return response.status(200).json({
      image: user.image,
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

// 删除用户头像
export const deleteProfileImage = async (request, response, next) => {
  try {
    const { userId } = request;
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).send("User not found.");
    }
    if (user.image) {
      unlinkSync(user.image);
    }
    user.image = null;
    await user.save();

    return response.status(200).send("Profile image removed successfully.");
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};
