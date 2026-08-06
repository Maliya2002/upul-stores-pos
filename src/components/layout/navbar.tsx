"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SearchCommand } from "@/components/shared/search-command";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn, getGreeting } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface NavbarProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  isMobile: boolean;
}

const notifications = [
  {
    id: 1,
    title: "Low Stock Alert",
    desc: "5 products running low on stock",
    time: "2 min ago",
    type: "warning",
  },
  {
    id: 2,
    title: "New Order #1234",
    desc: "Order has been placed successfully",
    time: "15 min ago",
    type: "success",
  },
  {
    id: 3,
    title: "Expiry Alert",
    desc: "3 products expiring this week",
    time: "1 hour ago",
    type: "error",
  },
];

export function Navbar({ onMenuClick }: NavbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { logout, user } = useAuth();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 backdrop-blur px-4"
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9 shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden sm:flex flex-col">
        <p className="text-sm font-semibold leading-tight">
          {getGreeting()},{" "}
          <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upul
          </span>{" "}
          👋
        </p>
        <p className="text-xs text-muted-foreground">
          Welcome back to your store
        </p>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <SearchCommand />

        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex h-9 w-9"
          onClick={toggleFullscreen}
        >
          <AnimatePresence mode="wait">
            {isFullscreen ? (
              <motion.div
                key="min"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Minimize2 className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="max"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Maximize2 className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors cursor-pointer">
              <Bell className="h-4 w-4" />
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-semibold text-sm">Notifications</span>
              <Badge variant="secondary" className="text-xs font-medium">
                {notifications.length} new
              </Badge>
            </div>
            <Separator />
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-0.5 py-3 px-4 cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      n.type === "warning" && "bg-amber-500",
                      n.type === "success" && "bg-emerald-500",
                      n.type === "error" && "bg-red-500"
                    )}
                  />
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-4">{n.desc}</p>
              </DropdownMenuItem>
            ))}
            <Separator />
            <DropdownMenuItem className="justify-center text-primary text-sm font-medium py-2.5 cursor-pointer">
              View all notifications →
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center justify-center h-9 w-9 rounded-full cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                  UA
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <p className="font-semibold">{user?.name ?? "Upul Admin"}</p>
                <p className="text-xs text-muted-foreground font-normal">
                  {user?.email ?? "admin@upulstores.lk"}
                </p>
                <Badge variant="secondary" className="w-fit text-[10px] mt-1">
                  {user?.role ?? "OWNER"}
                </Badge>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Store Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={logout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}