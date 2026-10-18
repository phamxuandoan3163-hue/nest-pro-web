import part0 from "../../workflow-gif-data/chunk-0.js";
import part1 from "../../workflow-gif-data/chunk-1.js";
import part2 from "../../workflow-gif-data/chunk-2.js";
import part3 from "../../workflow-gif-data/chunk-3.js";
import part4 from "../../workflow-gif-data/chunk-4.js";

export const runtime = "nodejs";

const gifBase64 = part0 + part1 + part2 + part3 + part4;
const gifBytes = Buffer.from(gifBase64, "base64");

export async function GET() {
  return new Response(gifBytes, {
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(gifBytes.length),
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
