import sharp from "sharp";
import part0 from "../../workflow-gif-data/chunk-0.js";
import part1 from "../../workflow-gif-data/chunk-1.js";
import part2 from "../../workflow-gif-data/chunk-2.js";
import part3 from "../../workflow-gif-data/chunk-3.js";
import part4 from "../../workflow-gif-data/chunk-4.js";
import part5 from "../../workflow-gif-data/chunk-5.js";

export const runtime = "nodejs";

const gifBase64 = part0 + part1 + part2 + part3 + part4 + part5;
const gifBytes = Buffer.from(gifBase64, "base64");

// Keep the transformed animation in memory during warm function invocations.
// The CDN can then cache the result rather than re-encoding the GIF on every visit.
let enhancedWebpPromise;

async function getEnhancedWebp() {
  if (!enhancedWebpPromise) {
    enhancedWebpPromise = (async () => {
      const sourceMetadata = await sharp(gifBytes, { animated: true }).metadata();

      const result = await sharp(gifBytes, {
        animated: true,
        pages: -1,
        limitInputPixels: 40000000,
      })
        .resize(1080, 824, {
          fit: "fill",
          kernel: "lanczos3",
        })
        .sharpen({ sigma: 1.05, m1: 1, m2: 2 })
        .webp({
          quality: 92,
          effort: 5,
          smartSubsample: true,
          loop: sourceMetadata.loop ?? 0,
          delay: sourceMetadata.delay ?? [700],
        })
        .toBuffer();

      const outputMetadata = await sharp(result, { animated: true }).metadata();
      if (outputMetadata.format !== "webp" || (sourceMetadata.pages > 1 && outputMetadata.pages < 2)) {
        throw new Error("Workflow preview did not encode as an animated WebP.");
      }

      return result;
    })().catch((error) => {
      enhancedWebpPromise = undefined;
      throw error;
    });
  }

  return enhancedWebpPromise;
}

export async function GET() {
  try {
    const webpBytes = await getEnhancedWebp();
    return new Response(webpBytes, {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(webpBytes.length),
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        "X-Workflow-Demo-Quality": "1080x824-enhanced",
      },
    });
  } catch {
    // Keep the homepage usable if the image encoder ever fails in a serverless runtime.
    return new Response(gifBytes, {
      headers: {
        "Content-Type": "image/gif",
        "Content-Length": String(gifBytes.length),
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Workflow-Demo-Quality": "fallback-gif",
      },
    });
  }
}
