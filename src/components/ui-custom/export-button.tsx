"use client";

import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  filename?: string;
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV<T extends Record<string, unknown>>(rows: T[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");
  return csv;
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  filename = "export",
}: ExportButtonProps<T>) {
  const exportCSV = () => {
    const csv = toCSV(data);
    downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
  };

  const exportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    downloadBlob(json, `${filename}.json`, "application/json");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent cursor-pointer">
          <Download className="h-4 w-4" />
          Export
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={exportCSV} className="cursor-pointer gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON} className="cursor-pointer gap-2">
          <FileJson className="h-4 w-4" />
          Export JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}