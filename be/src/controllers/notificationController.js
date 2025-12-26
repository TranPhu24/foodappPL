import Notification from "../models/notification.js";
import catchAsync from "../utils/catchAsync.js";

export const createNotification = catchAsync(async (req, res) => {
  const adminId = req.user.id;

  const {title,message,type = "normal",discount,} = req.body;

  if (!title || !message) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc",
    });
  }

  if (type === "discount") {
    if (!discount ||!discount.code ||!discount.startDate ||!discount.endDate) {
      return res.status(400).json({
        message: "Thiếu thông tin mã giảm giá",
      });
    }
  }

  const notification = await Notification.create({
    user: null,
    createdBy: adminId,
    type,
    title,
    message,
    discount: type === "discount" ? discount : undefined,
  });

  res.status(201).json({
    success: true,
    message: "Tạo thông báo thành công",
    notification ,
  });
});

export const getAllNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find()
    .populate("user", "name email")
    .populate("createdBy", "username email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    notifications ,
  });
});


export const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    return res.status(404).json({
      message: "Không tìm thấy thông báo",
    });
  }
  await notification.deleteOne();
  res.status(200).json({
    success: true,
    message: "Xóa thông báo thành công",
  });
});
