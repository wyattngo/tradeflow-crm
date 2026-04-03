import { Client } from "minio";

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: parseInt(process.env.MINIO_PORT ?? "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin123",
});

export const BUCKET = process.env.MINIO_BUCKET ?? "tradeflow-docs";

export async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET);
  }
}
export async function generateUploadUrl(
  objectKey: string,
  contentType: string
): Promise<string> {
  const url = await minioClient.presignedPutObject(BUCKET, objectKey, 300);
  const publicUrl = process.env.MINIO_PUBLIC_URL ?? "http://localhost:9000";
  return url.replace(/https?:\/\/[^/]+/, publicUrl);
}

export async function generateDownloadUrl(objectKey: string): Promise<string> {
  const url = await minioClient.presignedGetObject(BUCKET, objectKey, 3600);
  const publicUrl = process.env.MINIO_PUBLIC_URL ?? "http://localhost:9000";
  return url.replace(/https?:\/\/[^/]+/, publicUrl);
}
