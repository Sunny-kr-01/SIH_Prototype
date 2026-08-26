import { removeBackground } from "@imgly/background-removal-node";
import sharp from "sharp";

export async function enhanceProductImage(image) {
  console.log("Input MIME type:", image.mimetype);

  const inputBlob = new Blob(
    [image.buffer],
    {
      type: image.mimetype
    }
  );

  console.log("Removing background...");

  const result = await removeBackground(inputBlob, {
    output: {
      format: "image/png",
      quality: 0.9
    }
  });

  const resultBuffer = Buffer.from(
    await result.arrayBuffer()
  );

  console.log("Background removed.");

  const finalImage = await sharp(resultBuffer)
    .flatten({
      background: {
        r: 248,
        g: 248,
        b: 248
      }
    })
    .resize({
      width: 1200,
      height: 1200,
      fit: "contain",
      background: {
        r: 248,
        g: 248,
        b: 248
      }
    })
    .jpeg({
      quality: 90
    })
    .toBuffer();

  return {
    data: finalImage,
    mimeType: "image/jpeg"
  };
}