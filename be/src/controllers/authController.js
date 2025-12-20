import User from "../models/user.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import { sendEmail } from "../utils/sendEmail.js";

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

  const user = await User.create({
    username: username,
    email: email,
    hashedPassword: password,
    phone: null,
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
    return res.status(400).json({ 
      message: "Vui lòng nhập email và password" 
    });
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
    return res.status(401).json({ 
      message: "Thiếu refresh token" 
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("-hashedPassword"); 

    if (!user) {
      return res.status(401).json({ 
        message: "Refresh token không hợp lệ" 
      });
    }

    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ 
      message: "Refresh token không hợp lệ hoặc đã hết hạn" 
    });
  }
});


export const sendOTP = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      message: "Vui lòng nhập email" 
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ 
      message: "Email không tồn tại" 
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  user.resetOTP = otp;
  user.resetOTPExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendEmail(
    email,
    "Mã OTP đặt lại mật khẩu",
    `
      <div style="font-family: Arial; line-height: 1.5;">
        <h2>Xin chào ${user.username},</h2>
        <p>Mã OTP đặt lại mật khẩu của bạn là:</p>
        <h1 style="color:#e63946; font-size: 36px; margin-top: 8px;">${otp}</h1>
        <p>Mã có hiệu lực trong <strong>5 phút</strong>.</p>
      </div>
    `
  );

  res.json({ message: "OTP đã được gửi đến email của bạn" });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { email, password, otp } = req.body;

  if ( !email || !password || !otp) {
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ email, password và OTP",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ 
      message: "Thông tin người dùng không hợp lệ" 
    });
  }

  if (!user.resetOTP || !user.resetOTPExpires) {
    return res.status(400).json({ 
      message: "OTP chưa được tạo" 
    });
  }

  if (user.resetOTP !== otp) {
    return res.status(400).json({ 
      message: "OTP không đúng" 
    });
  }

  if (Date.now() > user.resetOTPExpires) {
    return res.status(400).json({ 
      message: "OTP đã hết hạn" 
    });
  }

  
  user.hashedPassword = password; 
  user.resetOTP = undefined;
  user.resetOTPExpires = undefined;

  await user.save();

  res.json({ 
    message: "Đặt lại mật khẩu thành công!" 
  });
});

