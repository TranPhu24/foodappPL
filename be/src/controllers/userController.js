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


export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-hashedPassword -resetOTP -resetOTPExpires")
    .populate("createdBy", "username email");

  if (!user) {
    return res.status(404).json({
      message: "Không tìm thấy người dùng",
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

export const addFavoriteProduct = catchAsync(async (req, res) => {
  const { productId } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "Không tìm thấy người dùng",
    });
  }

  if (user.favoriteFoods.includes(productId)) {
    return res.status(400).json({
      message: "Sản phẩm đã nằm trong danh sách yêu thích",
    });
  }

  user.favoriteFoods.push(productId);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Đã thêm sản phẩm vào yêu thích",
    favoriteFoods: user.favoriteFoods,
  });
});
export const removeFavoriteProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "Không tìm thấy người dùng",
    });
  }

  if (!user.favoriteFoods.includes(productId)) {
    return res.status(400).json({
      message: "Sản phẩm không có trong danh sách yêu thích",
    });
  }

  user.favoriteFoods.pull(productId);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Đã xoá sản phẩm khỏi yêu thích",
    favoriteFoods: user.favoriteFoods,
  });
});
export const getAllFavoriteProducts = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("favoriteFoods")
    .populate({
      path: "favoriteFoods",
      select: "name price image slug",
    });

  if (!user) {
    return res.status(404).json({
      message: "Không tìm thấy người dùng",
    });
  }

  res.status(200).json({
    success: true,
    count: user.favoriteFoods.length,
    favoriteFoods: user.favoriteFoods,
  });
});
