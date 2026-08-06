"use client";

import { useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
}

export function FileUpload({
  files,
  onFilesChange,
  multiple = true,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-3">
      <div
        className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 p-6 text-center hover:bg-muted/30"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">Click to upload files</p>
        <p className="text-xs text-muted-foreground">
          PDF, DOC, CSV or any document
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const selected = Array.from(e.target.files || []);
          onFilesChange(selected);
        }}
      />

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-lg border p-3"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm">{file.name}</span>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilesChange([])}
          >
            Clear Files
          </Button>
        </div>
      )}
    </div>
  );
}