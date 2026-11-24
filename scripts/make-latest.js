#!/usr/bin/env node
// Writes public/trame/latest.json for the plugin zip that is currently in public/trame/.
//
//   node scripts/make-latest.js 1.3.1
//
// It reads the version from the manifest inside the zip and stops if it is not the version you
// passed, then records the zip's SHA-256. Installed panels (1.3.0 and later) compare the
// downloaded file with that SHA-256 before installing it, so run this after every zip change
// and commit latest.json together with the zip.
const fs = require("fs"), path = require("path"), zlib = require("zlib"), crypto = require("crypto");

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version || "")) { console.error("Usage: node scripts/make-latest.js <version, e.g. 1.3.1>"); process.exit(1); }

const dir = path.join(__dirname, "..", "public", "trame");
const zipPath = path.join(dir, "NOVA-NESTING-TRAME-SET_UP.zip");
const buf = fs.readFileSync(zipPath);

// Read CSXS/manifest.xml out of the zip (stored or deflated entries; the package has no zip64).
function readEntry(zip, wanted) {
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) if (zip.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error("not a zip file");
  let p = zip.readUInt32LE(eocd + 16);
  for (let n = zip.readUInt16LE(eocd + 10); n > 0; n--) {
    const method = zip.readUInt16LE(p + 10), csize = zip.readUInt32LE(p + 20);
    const nlen = zip.readUInt16LE(p + 28), xlen = zip.readUInt16LE(p + 30), clen = zip.readUInt16LE(p + 32), lho = zip.readUInt32LE(p + 42);
    const name = zip.toString("utf8", p + 46, p + 46 + nlen);
    p += 46 + nlen + xlen + clen;
    if (!wanted.test(name)) continue;
    const start = lho + 30 + zip.readUInt16LE(lho + 26) + zip.readUInt16LE(lho + 28);
    const raw = zip.slice(start, start + csize);
    return (method === 8 ? zlib.inflateRawSync(raw) : raw).toString("utf8");
  }
  throw new Error("manifest not found in the zip");
}

const manifest = readEntry(buf, /com\.nova\.tramestudio\/CSXS\/manifest\.xml$/);
const inZip = (/ExtensionBundleVersion="([^"]+)"/.exec(manifest) || [])[1];
if (inZip !== version) { console.error(`The zip contains version ${inZip}, not ${version}. Rebuild the zip or pass the right version.`); process.exit(1); }

const latest = {
  version,
  download_url: "https://www.ainovanesting.pro/trame/NOVA-NESTING-TRAME-SET_UP.zip",
  sha256: crypto.createHash("sha256").update(buf).digest("hex"),
  released: new Date().toISOString().slice(0, 10)
};
fs.writeFileSync(path.join(dir, "latest.json"), JSON.stringify(latest, null, 2) + "\n");
console.log("Wrote public/trame/latest.json\n" + JSON.stringify(latest, null, 2));
