import "dotenv/config";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function generateProductInfo({
  image,
  audio,
  language
}) {
  const imageBase64 = image.buffer.toString("base64");
  const audioBase64 = audio.buffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: [
      {
        role: "user",
        parts: [
          {
            text:`
You are an AI assistant helping Indian artisans create professional
e-commerce product listings.

The artisan has provided:

1. A product image.
2. A voice recording describing the product.
3. A user-provided language hint: ${language}.

IMPORTANT LANGUAGE INSTRUCTIONS:

- The provided language is only a hint and must NOT be treated as
  authoritative.
- First identify the language actually spoken in the audio.
- Transcribe the speech faithfully in the ORIGINAL spoken language.
- Do NOT translate the original transcript into Hindi or English.
- Do NOT change the script of the original transcript.

For example:
- Bengali speech → Bengali transcript
- Odia speech → Odia transcript
- Marathi speech → Marathi transcript
- Kannada speech → Kannada transcript
- Hindi speech → Hindi transcript

If the language hint conflicts with the actual audio, trust the
audio and report the actual detected language.

After transcribing the audio:

1. Analyze the product image.
2. Combine the visual information with the artisan's description.
3. Extract relevant product information.
4. Create a professional e-commerce product listing.

IMPORTANT:
- Do not invent product properties that cannot reasonably be inferred.
- If some information is unavailable, use an empty string.
- Preserve the artisan's intended meaning.
- Clearly distinguish between information provided by the artisan
  and information reasonably inferred from the image.
- Generate a polished English description.
- Generate a natural Hindi description.
- Generate a natural product description in the detected spoken language.
- The detected-language description must be a product listing, not a transcript.
- Provide useful e-commerce keywords.
`
          },

          {
            inlineData: {
              mimeType: image.mimetype,
              data: imageBase64
            }
          },

          {
            inlineData: {
              mimeType: audio.mimetype,
              data: audioBase64
            }
          }
        ]
      }
    ],

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: Type.OBJECT,

        properties: {
          transcriptOriginal: {
            type: Type.STRING,
            description: "Transcription of the artisan's speech in the original language"
          },

          detectedLanguage: {
            type: Type.STRING,
            description: "Language spoken in the audio"
          },

          title: {
            type: Type.STRING,
            description: "Professional e-commerce product title"
          },

          category: {
            type: Type.STRING,
            description: "Product category"
          },

          material: {
            type: Type.STRING,
            description: "Main material used in the product"
          },

          craft: {
            type: Type.STRING,
            description: "Craft or traditional production technique"
          },

          descriptionEnglish: {
            type: Type.STRING,
            description: "Professional e-commerce description in English"
          },

          descriptionHindi: {
            type: Type.STRING,
            description: "Professional e-commerce description in Hindi"
          },

          descriptionOriginal: {
            type: Type.STRING,
            description: "Professional e-commerce description in the detected spoken language"
          },

          keywords: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description: "Relevant e-commerce search keywords"
          }
        },

        required: [
          "transcriptOriginal",
          "detectedLanguage",
          "title",
          "category",
          "material",
          "craft",
          "descriptionEnglish",
          "descriptionHindi",
          "descriptionOriginal",
          "keywords"
        ]
      }
    }
  });

  return JSON.parse(response.text);
}