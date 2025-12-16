import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ message: "Authorization header không hợp lệ" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedUser) => {
      if (err) {
        console.error("JWT ERROR:", err.name, err.message);
        return res
          .status(403)
          .json({ message: "Access token hết hạn hoặc không đúng" });
      }

      const user = await User.findById(decodedUser.userId).select(
        "-hashedPassword"
      );

      if (!user) {
        return res
          .status(404)
          .json({ message: "Người dùng không tồn tại" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Middleware error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Không có thông tin user" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Bạn không có quyền truy cập vào tài nguyên này" 
      });
    }

    next();
  };
};