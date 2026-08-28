import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import catalogRouter from "./routes/catalog.js";
import imageRouter from "./routes/image.js";
import pricingRouter from "./routes/pricing.js";
import testCloudinaryRouter from "./routes/testCloudinary.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use("/api/test-cloudinary", testCloudinaryRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/image", imageRouter);
app.use("/api/pricing", pricingRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Artisan AI backend is running"
  });
});

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://10.5.65.32:${PORT}`);
});