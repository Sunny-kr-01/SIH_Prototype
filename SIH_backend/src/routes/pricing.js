import express from "express";
import multer from "multer";

import { extractPricingData } from "../services/pricingService.js";
import { calculateB2BPrice } from "../services/pricingEngine.js";
import Product from "../models/product.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

router.post(
    "/suggest",
    upload.single("audio"),
    async (req, res) => {

        try {

            const description =
                req.body?.description?.trim() || null;

            const audio =
                req.file || null;

            const productId =
                req.body?.productId || null;

            const parseNumber = (value) =>
                value === undefined || value === ""
                    ? null
                    : Number(value);

            const materialCost =
                parseNumber(req.body?.materialCost);

            const workingDays =
                parseNumber(req.body?.workingDays);

            const hoursPerDay =
                parseNumber(req.body?.hoursPerDay);

            const otherCosts =
                parseNumber(req.body?.otherCosts);

            const hasStructuredData = [
                materialCost,
                workingDays,
                hoursPerDay,
                otherCosts
            ].some((value) => Number.isFinite(value));

            if (!description && !audio && !hasStructuredData) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Provide product information, cost information, or voice input."
                });
            }

            const pricingData =
                await extractPricingData({
                    description,
                    audio,
                    materialCost,
                    workingDays,
                    hoursPerDay,
                    otherCosts
                });

            if (Number.isFinite(materialCost)) {
                pricingData.materials = [{
                    name: "Provided materials",
                    quantity: 1,
                    unit: "product",
                    totalCost: materialCost
                }];
            }

            if (Number.isFinite(workingDays) || Number.isFinite(hoursPerDay)) {
                pricingData.labor = {
                    ...pricingData.labor,
                    ...(Number.isFinite(workingDays) ? { days: workingDays } : {}),
                    ...(Number.isFinite(hoursPerDay) ? { hoursPerDay } : {})
                };
                delete pricingData.labor.estimatedHours;
            }

            if (Number.isFinite(otherCosts)) {
                pricingData.otherCosts = otherCosts;
            }

            const price =
                calculateB2BPrice(pricingData);

            if (!price.success) {
                return res.status(400).json({
                    success: false,
                    error:
                        price.message ||
                        "Not enough pricing information",
                    pricingData,
                    price
                });
            }

            let product = null;

            if (productId) {

                product =
                    await Product.findByIdAndUpdate(
                        productId,
                        {
                            pricing: {
                                suggestedPrice:
                                    price.suggestedPrice,

                                minimumPrice:
                                    price.minimumPrice,

                                maximumPrice:
                                    price.maximumPrice,

                                bulkPricing: price.bulkPricing,

                                currency: "INR"
                            }
                        },
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
            }

            res.json({
                success: true,
                pricingData,
                price,
                product
            });

        } catch (error) {

            console.error(
                "PRICING ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);

export default router;