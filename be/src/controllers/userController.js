import User from "../models/user.js";
import catchAsync from "../utils/catchAsync.js";
export const createEmployee = catchAsync(async (req, res) => {
  const { username, email, password, phone } = req.body;

  if (!username || !email || !password || !phone) {
    return res.status(400).json({
      message: "Vui lòng cung cấp đầy đủ username, email và password, phone",
    });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      message: "Email này đã được sử dụng",
    });
  }

  const newEmployee = await User.create({
    username: username,
    email: email,
    hashedPassword: password, 
    role: "employee",
    phone: phone,        
    createdBy: req.user._id, 
  });

  res.status(201).json({
    message: "Tạo nhân viên thành công!",
    user: {
      id: newEmployee._id,
      username: newEmployee.username,
      email: newEmployee.email,
      role: newEmployee.role,
      phone: newEmployee.phone,
      createdBy: req.user.username,
    },
  });
});

export const getAllEmployees = catchAsync(async (req, res) => {
  const employees = await User.find({ role: "employee" })
    .populate("createdBy", "username email");

  res.status(200).json({
    message: "Lấy danh sách nhân viên thành công",
    employees,
  });
});

export const deleteEmployee = catchAsync(async (req, res) => {
  const { id } = req.params;

  const employee = await User.findOne({ _id: id, role: "employee" });

  if (!employee) {
    return res.status(404).json({
      message: "Không tìm thấy nhân viên",
    });
  }

  await User.deleteOne({ _id: id });

  res.status(200).json({
    message: "Xóa nhân viên thành công",
  });
});
