"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductQrCardProps {
  value: string;
}

export function ProductQrCard({ value }: ProductQrCardProps) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let mounted = true;

    QRCode.toDataURL(value, {
      width: 220,
      margin: 2,
    }).then((dataUrl) => {
      if (mounted) setSrc(dataUrl);
    });

    return () => {
      mounted = false;
    };
  }, [value]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-52 items-center justify-center">
        {src ? (
          <img src={src} alt="Product QR" className="h-52 w-52 rounded-lg" />
        ) : (
          <p className="text-sm text-muted-foreground">Generating QR code...</p>
        )}
      </CardContent>
    </Card>
  );
}