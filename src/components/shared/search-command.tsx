"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { navigationConfig } from "@/config/navigation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useKeyboardShortcut([
    {
      key: "k",
      ctrlKey: true,
      callback: () => setOpen(true),
    },
  ]);

  const allItems = navigationConfig.flatMap((group) =>
    group.items.flatMap((item) => [item, ...(item.children || [])])
  );

  const filteredItems = search
    ? allItems.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      )
    : allItems.slice(0, 8);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 lg:h-9 lg:w-64 lg:justify-start lg:px-3 lg:text-sm"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 lg:mr-2 shrink-0" />
        <span className="hidden lg:inline text-muted-foreground">
          Search...
        </span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
          ⌘K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-120 p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>

          <div className="flex items-center border-b px-4 py-3">
            <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-sm"
              autoFocus
            />
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            <AnimatePresence>
              {filteredItems.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No results found for &quot;{search}&quot;
                </p>
              ) : (
                <div className="space-y-0.5">
                  {filteredItems.map((item, index) => (
                    <motion.button
                      key={item.href}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelect(item.href)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-md border bg-background">
                        <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t px-4 py-2 flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border px-1 py-0.5 font-mono">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border px-1 py-0.5 font-mono">Esc</kbd>
              Close
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}