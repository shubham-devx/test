import { promises as fs } from "fs";
import path from "path";
import { get, put } from "@vercel/blob";

function blobPath(filePath: string): string {
  return `data/${path.basename(filePath)}`;
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await get(blobPath(filePath), { access: "private", useCache: false });
    if (blob) return JSON.parse(await new Response(blob.stream).text()) as T;
  }

  try {
    return JSON.parse(await fs.readFile(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(filePath: string, value: T): Promise<void> {
  const body = JSON.stringify(value, null, 2);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(blobPath(filePath), body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, body, "utf-8");
}
