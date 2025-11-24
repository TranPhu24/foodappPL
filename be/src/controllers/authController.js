import User from "../models/user.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";

export const register = catchAsync(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Vui lòng cung cấp đầy đủ username, email và password",
    });
  }

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    return res.status(400).json({ message: "Email này đã được đăng ký" });
  }

  //tạo user mới
  const user = await User.create({
    username: username,
    email: email,
    hashedPassword: password,
    role: role || "user",
  });

  res.status(201).json({
    message: "Đăng ký thành công!",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập email và password" });
  }

  const user = await User.findOne({ email: email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
  }

  res.json({
    message: "Đăng nhập thành công!",
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Thiếu refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("-hashedPassword"); 

    if (!user) {
      return res.status(401).json({ message: "Refresh token không hợp lệ" });
    }

    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });
  }
});