import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";

import connectDB from "./libs/db.js";

import passport from "passport";
import "./libs/passport.js"; 

import http from "http";
import { initSocket } from "./libs/socket.js";

import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import userRoute from "./routes/userRoute.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import reportRoute from "./routes/reportRoute.js"
import discountRoute from "./routes/discountRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import chatRoute from "./routes/chatRoute.js";

import { swaggerSpec, swaggerUiMiddleware } from "./libs/swagger.js";

connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,  
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

app.use(express.json());
app.use(passport.initialize());

const server = http.createServer(app);
initSocket(server);

app.use("/api-docs", swaggerUiMiddleware.serve);
app.get("/api-docs", swaggerUiMiddleware.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true, 
  },
}));
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/user", userRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin/reports", reportRoute);
app.use("/api/discounts", discountRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/chat", chatRoute);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});