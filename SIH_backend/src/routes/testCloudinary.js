import express from "express";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();

    res.json({
      success: true,
      message: "Cloudinary connected successfully",
      result
    });
  } catch (error) {
    console.error("Cloudinary connection failed:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;