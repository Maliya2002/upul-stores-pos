import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FilterBarProps {
  children: React.ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        {children}
      </CardContent>
    </Card>
  );
}