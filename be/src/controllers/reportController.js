import Order from "../models/order.js";

const getGroupBy = (type) => {
  switch (type) {
    case "day":
      return {
        year: { $year: "$completedAt" },
        month: { $month: "$completedAt" },
        day: { $dayOfMonth: "$completedAt" },
      };
    case "week":
      return {
        year: { $year: "$completedAt" },
        week: { $isoWeek: "$completedAt" },
      };
    case "month":
      return {
        year: { $year: "$completedAt" },
        month: { $month: "$completedAt" },
      };
    default:
      throw new Error("Invalid report type");
  }
};

export const getRevenueReport = async (req, res) => {
  try {
    const { type = "day" } = req.query;

    const groupBy = getGroupBy(type);

    const data = await Order.aggregate([
      {
        $match: {
          orderStatus: "completed",
          paymentStatus: "paid",
          completedAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: "$finalTotal" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
          "_id.week": 1,
        },
      },
    ]);

    res.json({
      type,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
