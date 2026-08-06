"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductImageUpload({
  value,
  onChange,
}: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    const urls = await Promise.all(list.map(fileToDataUrl));
    onChange([...value, ...urls]);
  };

  const addUrlImage = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setImageUrl("");
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Upload Images
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Paste image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={addUrlImage}>
            <Link2 className="mr-2 h-4 w-4" />
            Add URL
          </Button>
        </div>
      </div>

      {value.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <div className="h-40 w-full bg-muted">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="truncate text-sm text-muted-foreground">
                  Image {index + 1}
                </p>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeImage(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No images added yet.
        </div>
      )}
    </div>
  );
}