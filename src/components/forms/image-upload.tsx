"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
}

export function ImageUpload({
  files,
  onFilesChange,
  multiple = true,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    [files]
  );

  return (
    <div className="space-y-3">
      <div
        className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 p-6 text-center hover:bg-muted/30"
        onClick={() => inputRef.current?.click()}
      >
        <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">Click to upload images</p>
        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const selected = Array.from(e.target.files || []);
          onFilesChange(selected);
        }}
      />

      {previews.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {previews.map((item, index) => (
            <div
              key={`${item.file.name}-${index}`}
              className="overflow-hidden rounded-xl border"
            >
              <div className="relative h-40 w-full bg-muted">
                <Image
                  src={item.preview}
                  alt={item.file.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="truncate text-sm">{item.file.name}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onFilesChange(files.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}