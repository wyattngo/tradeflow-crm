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
  _contentType: string
): Promise<string> {
  return minioClient.presignedPutObject(BUCKET, objectKey, 300);
}

export async function generateDownloadUrl(objectKey: string): Promise<string> {
  return minioClient.presignedGetObject(BUCKET, objectKey, 3600);
}
