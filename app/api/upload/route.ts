import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateUploadUrl, generateDownloadUrl } from "@/lib/minio";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, contentType, orderId } = await req.json();

  if (!filename || !orderId) {
    return NextResponse.json({ error: "Missing filename or orderId" }, { status: 400 });
  }

  const ext = filename.split(".").pop();
  const objectKey = `orders/${orderId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const uploadUrl = await generateUploadUrl(objectKey, contentType ?? "application/octet-stream");

  return NextResponse.json({ uploadUrl, objectKey });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const objectKey = searchParams.get("key");

  if (!objectKey) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const downloadUrl = await generateDownloadUrl(objectKey);

  return NextResponse.json({ downloadUrl });
}
