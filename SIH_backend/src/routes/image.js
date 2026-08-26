import express from "express";
import multer from "multer";
import { enhanceProductImage } from "../services/imageEnhancer.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

router.post(
    "/enhance",
    upload.single("image"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: "Image is required"
                });
            }

            const result = await enhanceProductImage(req.file);

            const imageBuffer = Buffer.from(result.data, "base64");

            res.set("Content-Type", result.mimeType);
            res.send(imageBuffer);

        } catch (error) {
            console.error("IMAGE ENHANCEMENT ERROR:", error);

            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);

export default router;