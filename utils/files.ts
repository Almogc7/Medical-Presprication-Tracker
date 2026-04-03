import crypto from "node:crypto";
import path from "node:path";

export function sanitizeFilename(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function generateStoredFilename(originalName: string) {
  const parsed = path.parse(originalName);
  const safeBase = sanitizeFilename(parsed.name || "document");
  const ext = parsed.ext.toLowerCase() === ".pdf" ? ".pdf" : ".pdf";
  const token = crypto.randomBytes(8).toString("hex");

  return `${safeBase}-${token}${ext}`;
}
