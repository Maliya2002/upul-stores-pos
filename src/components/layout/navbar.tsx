"use client";

import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

interface NavbarProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  isMobile: boolean;
}

function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  return greeting;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { logout, user } = useAuth();
  const greeting = useGreeting();

  const userName = user?.name ?? "User";
  const userEmail = user?.email ?? "";
  const userRole = user?.role ?? "CASHIER";
  const userInitials = getInitials(userName);

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
      {/* Mobile Menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9 shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Greeting */}
      <div className="hidden sm:flex flex-col min-w-0">
        <p className="text-sm font-semibold leading-tight truncate">
          {greeting},{" "}
          <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {userName.split(" ")[0]}
          </span>{" "}
          👋
        </p>
        <p className="text-xs text-muted-foreground truncate">
          Welcome to your store dashboard
        </p>
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Search */}
        <SearchCommand />

        {/* Fullscreen — Desktop */}
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

        {/* Notifications */}
        <Link href="/notifications">
          <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors cursor-pointer">
            <Bell className="h-4 w-4" />
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500"
            />
          </div>
        </Link>

        {/* Theme */}
        <ThemeToggle />

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 cursor-pointer rounded-full p-0.5 hover:ring-2 hover:ring-primary/20 transition-all"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              {/* Desktop: show name */}
              <div className="hidden xl:flex flex-col text-left mr-1">
                <span className="text-xs font-semibold leading-tight truncate max-w-30">
                  {userName}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {userRole}
                </span>
              </div>
            </motion.div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60">
            {/* Profile Header */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userEmail}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-[10px] mt-1 font-semibold"
                  >
                    {userRole}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <DropdownMenuItem className="cursor-pointer py-2.5">
              <Link href="/settings" className="flex items-center w-full">
                Profile Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer py-2.5">
              <Link href="/settings/store" className="flex items-center w-full">
                Store Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer py-2.5">
              <Link href="/settings/backup" className="flex items-center w-full">
                Backup & Restore
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 py-2.5 font-semibold"
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