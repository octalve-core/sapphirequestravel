import { openSync, readSync, closeSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const required = [
  "hero-about.webp",
  "hero-services.webp",
  "hero-packages.webp",
  "hero-visa.webp",
  "hero-curated-travel.webp",
  "hero-contact.webp",
  "hero-request.webp",
];

let invalid = 0;
for (const file of required) {
  const path = join(process.cwd(), "public", "images", file);
  if (!existsSync(path)) {
    console.error("MISSING:", file);
    invalid += 1;
    continue;
  }
  const stats = statSync(path);
  const magic = Buffer.alloc(12);
  const fd = openSync(path, "r");
  try { readSync(fd, magic, 0, 12, 0); } finally { closeSync(fd); }
  const isWebP = magic.toString("ascii", 0, 4) === "RIFF"
    && magic.toString("ascii", 8, 12) === "WEBP";
  if (!isWebP || stats.size < 10000) {
    console.error("INVALID: not a valid or sufficiently sized WebP file:", file);
    invalid += 1;
  } else {
    console.log("OK:", file, Math.round(stats.size / 1024) + " KiB");
  }
}
if (invalid > 0) {
  console.error("Missing/invalid hero images. Do not merge or deploy until all seven are supplied.");
  process.exitCode = 1;
} else {
  console.log("All seven new hero image files are ready.");
}
