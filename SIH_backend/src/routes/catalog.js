import express from "express";
import multer from "multer";
import { generateProductInfo } from "../services/gemini.js";
import Product from "../models/product.js";
import { uploadImage } from "../services/cloudinaryService.js";
import sharp from "sharp";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB per file
  }
});

router.post(
  "/generate",
  upload.fields([
    { name: "image", maxCount: 4 },
    { name: "audio", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const images = req.files?.image || [];
      const image = images[0];
      const audio = req.files?.audio?.[0];

      const language = String(req.body.language || "en").toLowerCase();

      if (!image) {
        return res.status(400).json({
          success: false,
          error: "Product image is required"
        });
      }

      if (!audio) {
        return res.status(400).json({
          success: false,
          error: "Artisan audio is required"
        });
      }

      const result = await generateProductInfo({
        image,
        audio,
        language
      });

      const rankedImages = await Promise.all(images.map(async (candidate, index) => {
        const metadata = await sharp(candidate.buffer).metadata();
        return {
          candidate,
          index,
          score: (metadata.width || 0) * (metadata.height || 0)
        };
      }));
      rankedImages.sort((left, right) => right.score - left.score || left.index - right.index);
      const bestImages = rankedImages.slice(0, 3);
      const uploadedImages = await Promise.all(bestImages.map(({ candidate }) =>
        uploadImage(candidate.buffer, candidate.mimetype)
      ));

      // Create product document from AI result
      const product = await Product.create({
        title: result.title,
        description: result.descriptionEnglish,
        category: result.category,

        craft: result.craft,

        transcriptOriginal: result.transcriptOriginal,

        keywords: result.keywords,

        originalLanguage: result.detectedLanguage,

        translations: [
          {
            language: "en",
            title: result.title,
            description: result.descriptionEnglish
          },
          {
            language: "hi",
            title: result.title,
            description: result.descriptionHindi
          },
          ...(!["en", "english", "hi", "hindi"].includes(String(result.detectedLanguage).toLowerCase())
            ? [{
                language: result.detectedLanguage,
                title: result.title,
                description: result.descriptionOriginal
              }]
            : [])
        ],

        // We are not storing the uploaded image itself in MongoDB.
        // Image storage will be handled separately.
        images: uploadedImages.map((uploadedImage) => uploadedImage.secure_url),

        materials: [
          {
            name: result.material,
            quantity: "",
            cost: undefined
          }
        ],

        pricing: {
          currency: "INR"
        }
      });

      res.status(201).json({
        success: true,
        result,
        product
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        error: "Failed to generate product information"
      });
    }
  }
);

// Save a generated product listing
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product listing created successfully",
      product
    });
  } catch (error) {
    console.error("Create listing error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all product listings
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("Fetch catalog error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch product listings"
    });
  }
});

// Get products for the buyer marketplace
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error("Fetch marketplace products error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch products"
    });
  }
});

// Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Fetch product error:", error);

    res.status(400).json({
      success: false,
      error: "Invalid product ID"
    });
  }
});

// Update a product listing
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a product listing
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(400).json({
      success: false,
      error: "Invalid product ID"
    });
  }
});

router.post("/save", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      originalLanguage,
      translations,
      images,
      materials,
      artisan
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: "Title, description and category are required"
      });
    }

    const product = await Product.create({
      title,
      description,
      category,
      originalLanguage: originalLanguage || "unknown",
      translations: translations || [],
      images: images || [],
      materials: materials || [],
      artisan: artisan || {}
    });

    res.status(201).json({
      success: true,
      product
    });

  } catch (error) {
    console.error("SAVE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      error: "Failed to save product"
    });
  }
});

export default router;