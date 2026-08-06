"use client";

import Barcode from "react-barcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductBarcodeCardProps {
  value?: string | null;
}

export function ProductBarcodeCard({ value }: ProductBarcodeCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Barcode</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-52 items-center justify-center">
        {value ? (
          <div className="rounded-xl bg-white p-4">
            <Barcode value={value} height={60} fontSize={14} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No barcode available</p>
        )}
      </CardContent>
    </Card>
  );
}