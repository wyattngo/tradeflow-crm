"use client";

import { useState, useCallback } from "react";

interface FileUploadProps {
  orderId: string;
  onUploadComplete: (data: { fileUrl: string; fileKey: string; filename: string }) => void;
}

export function FileUpload({ orderId, onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);

      try {
        // Get presigned URL
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            orderId,
          }),
        });

        if (!res.ok) throw new Error("Failed to get upload URL");

        const { uploadUrl, objectKey } = await res.json();

        // Upload to MinIO
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        await new Promise<void>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.send(file);
        });

        onUploadComplete({
          fileUrl: uploadUrl.split("?")[0],
          fileKey: objectKey,
          filename: file.name,
        });
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload thất bại. Vui lòng thử lại.");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [orderId, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging
          ? "border-[#ffbf00] bg-[#ffbf00]/5"
          : "border-[#2a2a2a] hover:border-zinc-600"
      }`}
    >
      {uploading ? (
        <div className="space-y-2">
          <p className="text-sm text-zinc-400">Đang tải lên... {progress}%</p>
          <div className="w-full bg-zinc-800 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-[#ffbf00] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-zinc-400 mb-2">
            Kéo thả file vào đây hoặc
          </p>
          <label className="inline-block px-4 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-zinc-300 hover:border-zinc-600 cursor-pointer transition-colors">
            Chọn file
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </label>
          <p className="text-xs text-zinc-600 mt-2">
            PDF, DOC, XLS, JPG, PNG — tối đa 50MB
          </p>
        </>
      )}
    </div>
  );
}
