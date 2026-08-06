import { Heart } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t py-3 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <p className="flex items-center gap-1">
          Made with{" "}
          <Heart className="h-3 w-3 text-red-500 fill-red-500 inline" /> by{" "}
          {siteConfig.author}
        </p>
        <p>v{siteConfig.version}</p>
      </div>
    </footer>
  );
}