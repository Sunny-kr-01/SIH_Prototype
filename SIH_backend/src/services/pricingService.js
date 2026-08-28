import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export async function extractPricingData({
    description,
    audio,
    materialCost,
    workingDays,
    hoursPerDay,
    otherCosts
}) {

    const parts = [];

    const prompt = `
You are an AI pricing assistant for Indian handmade-artisan products sold B2B.

Your job is to analyze the artisan's product description or speech and
extract information required to estimate a FAIR WHOLESALE B2B SELLING PRICE.

IMPORTANT:

- Never invent material costs if the artisan did not provide them.
- Never invent the artisan's actual expenses.
- However, you MAY classify the type, skill level and complexity of the
  labor required to make the product.
- Labor classification should be based on the described craft and work.
- Do not assume every artisan has the same hourly labor rate.
- Prefer conservative labor estimates for ordinary products. Do not turn a
    simple product into a highly skilled or high-complexity job without clear
    evidence from the artisan.
- Estimate only one item's labor effort, not the value of the finished product
    at retail or marketplace price.
- Do not directly decide the final selling price.
- Return structured information for a separate pricing engine.

Analyze:

1. Product/craft type
2. Materials
3. Material costs if explicitly provided
4. Labor type
5. Labor skill level
6. Labor complexity
7. Working time if explicitly provided
8. Other costs if explicitly provided

Labor skill levels:

- basic
- intermediate
- skilled
- highly_skilled

Labor complexity:

- low
- medium
- high
- very_high

If working time is not explicitly provided, estimate the approximate
labor effort required ONLY if it can reasonably be inferred from the
described product and craft.

Clearly mark estimated values as estimated.

Return ONLY valid JSON.
`;

    parts.push({
        text: prompt
    });

    if (description) {
        parts.push({
            text: `Artisan's description:\n${description}`
        });
    }

    if (audio) {
        parts.push({
            inlineData: {
                mimeType: audio.mimetype,
                data: audio.buffer.toString("base64")
            }
        });
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",

        contents: [
            {
                role: "user",
                parts
            }
        ],

        config: {
            responseMimeType: "application/json",

            responseSchema: {
                type: Type.OBJECT,

                properties: {

                    transcript: {
                        type: Type.STRING
                    },

                    craft: {
                        type: Type.STRING
                    },

                    productType: {
                        type: Type.STRING
                    },

                    materials: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: {
                                    type: Type.STRING
                                },
                                quantity: {
                                    type: Type.NUMBER,
                                    nullable: true
                                },
                                unit: {
                                    type: Type.STRING
                                },
                                totalCost: {
                                    type: Type.NUMBER,
                                    nullable: true
                                }
                            },
                            required: [
                                "name",
                                "quantity",
                                "unit",
                                "totalCost"
                            ]
                        }
                    },

                    labor: {
                        type: Type.OBJECT,
                        properties: {

                            days: {
                                type: Type.NUMBER,
                                nullable: true
                            },

                            hoursPerDay: {
                                type: Type.NUMBER,
                                nullable: true
                            },

                            estimatedHours: {
                                type: Type.NUMBER,
                                nullable: true
                            },

                            skillLevel: {
                                type: Type.STRING
                            },

                            complexity: {
                                type: Type.STRING
                            },

                            laborType: {
                                type: Type.STRING
                            }
                        },

                        required: [
                            "days",
                            "hoursPerDay",
                            "estimatedHours",
                            "skillLevel",
                            "complexity",
                            "laborType"
                        ]
                    },

                    otherCosts: {
                        type: Type.NUMBER,
                        nullable: true
                    }
                },

                required: [
                    "transcript",
                    "craft",
                    "productType",
                    "materials",
                    "labor",
                    "otherCosts"
                ]
            }
        }
    });

    return JSON.parse(response.text);
}