import Product from "../models/product.js";
import Category from "../models/category.js";
import catchAsync from "../utils/catchAsync.js";

import cloudinary from "../libs/cloudinary.js";


export const createProduct = catchAsync(async (req, res) => {
  const { name, price, description, category, stock } = req.body;

  const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        message: true,
        message: "Danh mục không tồn tại",
      });
    }

  if (!req.file)
    return res.status(400).json({ message: "Chưa upload hình ảnh" });

  // Upload file buffer lên Cloudinary
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "foodapp" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(req.file.buffer);
  });


  const product = await Product.create({
    name,
    price,
    image: result.secure_url, 
    description,
    category,
    stock,
  });

  res.status(201).json({
    message: "Tạo sản phẩm thành công",
    product,
  });
});


export const getProducts = catchAsync(async (req, res) => {
  const products = await Product.find().populate("category", "name");

  res.status(200).json({
    success: true,
    message: "Lấy danh sách sản phẩm thành công",
    data: {
      products,
    },
  });
});
export const getProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name");
  if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

  res.json(product);
});

export const updateProduct = catchAsync(async (req, res) => {
  let updateData = { ...req.body };

  // upload ảnh mới
  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "foodapp" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    updateData.image = result.secure_url; 
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }

  res.json({
    message: "Cập nhật thành công",
    product,
  });
});


export const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

  res.json({ message: "Xoá sản phẩm thành công" });
});
