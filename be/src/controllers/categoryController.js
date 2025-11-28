import Category from "../models/category.js";
import catchAsync from "../utils/catchAsync.js";

export const createCategory = catchAsync(async (req, res) => {
  const { name, description } = req.body;

  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json({ message: "Danh mục đã tồn tại" });

  const category = await Category.create({ name, description });

  res.status(201).json({
    message: "Tạo danh mục thành công",
    category,
  });
});

export const getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

export const getCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Không tìm thấy" });

  res.json(category);
});

export const updateCategory = catchAsync(async (req, res) => {
  const { name, description } = req.body;

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description },
    { new: true }
  );

  if (!category) return res.status(404).json({ message: "Không tìm thấy" });

  res.json({
    message: "Cập nhật thành công",
    category,
  });
});

export const deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: "Không tìm thấy" });

  res.json({ message: "Xoá danh mục thành công" });
});
