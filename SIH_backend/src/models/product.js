import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        // Basic product information
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        craft: {
            type: String,
            trim: true
        },

        transcriptOriginal: {
            type: String,
            trim: true
        },

        keywords: [
            {
                type: String,
                trim: true
            }
        ],

        // Language in which the artisan originally provided the information
        originalLanguage: {
            type: String,
            default: "hi"
        },

        // Translated versions for buyers
        translations: [
            {
                language: {
                    type: String,
                    required: true
                },

                title: {
                    type: String,
                    required: true
                },

                description: {
                    type: String,
                    required: true
                }
            }
        ],

        // Images associated with the listing
        images: [
            {
                type: String
            }
        ],

        // Materials used to create the product
        materials: [
            {
                name: String,
                quantity: String,
                cost: Number
            }
        ],

        // Pricing information
        pricing: {
            suggestedPrice: {
                type: Number
            },

            minimumPrice: {
                type: Number
            },

            maximumPrice: {
                type: Number
            },

            currency: {
                type: String,
                default: "INR"
            }
        },

        // Artisan information
        artisan: {
            name: {
                type: String,
                trim: true
            },

            location: {
                type: String,
                trim: true
            }
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;