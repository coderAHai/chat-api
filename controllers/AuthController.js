import User from "../models/UserModel.js";
import signPackage from "jsonwebtoken";
import bcryptPackage from "bcryptjs";

const maxAge = 7 * 24 * 60 * 60 * 1000;
const { sign } = signPackage;
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
      username: user.username,
      image: user.image,
      color: user.color,
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

// 获取用户信息
export const getUserInfo = async (request, response, next) => {};
