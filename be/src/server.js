import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./libs/db.js";



import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import userRoute from "./routes/userRoute.js";

import { swaggerSpec, swaggerUiMiddleware } from "./libs/swagger.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",  
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});