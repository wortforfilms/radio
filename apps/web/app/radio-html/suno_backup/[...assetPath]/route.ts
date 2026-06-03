import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".json": "application/json; charset=utf-8"
};

type Params = {
  params: Promise<{
    assetPath?: string[];
  }>;
};

function assetRoot() {
  return path.resolve(process.cwd(), "_radio_index", "suno_backup");
}

function contentTypeFor(filePath: string) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

async function resolveAsset(assetPath: string[]) {
  const root = assetRoot();
  const filePath = path.resolve(root, ...assetPath);

  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    return null;
  }

  const info = await stat(filePath).catch(() => null);
  if (!info?.isFile()) {
    return null;
  }

  return { filePath, info };
}

export async function GET(request: NextRequest, { params }: Params) {
  const { assetPath = [] } = await params;
  const asset = await resolveAsset(assetPath);

  if (!asset) {
    return new Response("Radio asset not found", { status: 404 });
  }

  const { filePath, info } = asset;
  const contentType = contentTypeFor(filePath);
  const range = request.headers.get("range");

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      return new Response("Invalid range", { status: 416 });
    }

    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : info.size - 1;

    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || end >= info.size) {
      return new Response("Range not satisfiable", {
        status: 416,
        headers: { "content-range": `bytes */${info.size}` }
      });
    }

    const stream = createReadStream(filePath, { start, end });
    return new Response(stream as unknown as BodyInit, {
      status: 206,
      headers: {
        "accept-ranges": "bytes",
        "cache-control": "public, max-age=31536000, immutable",
        "content-length": String(end - start + 1),
        "content-range": `bytes ${start}-${end}/${info.size}`,
        "content-type": contentType
      }
    });
  }

  const stream = createReadStream(filePath);
  return new Response(stream as unknown as BodyInit, {
    headers: {
      "accept-ranges": "bytes",
      "cache-control": "public, max-age=31536000, immutable",
      "content-length": String(info.size),
      "content-type": contentType
    }
  });
}
