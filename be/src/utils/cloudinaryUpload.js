import multer from "multer";
import cloudinary from "../libs/cloudinary.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
