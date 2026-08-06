"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { UserRole } from "@/types/auth";
import { toast } from "sonner";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const userRole = (session?.user as { role?: UserRole } | undefined)?.role;
  const userName = session?.user?.name;
  const userEmail = session?.user?.email;
  const userImage = session?.user?.image;

  const user = session?.user
    ? {
        id: (session.user as { id?: string }).id ?? "",
        name: userName ?? "",
        email: userEmail ?? "",
        role: userRole ?? ("CASHIER" as UserRole),
        image: userImage,
        isActive: (session.user as { isActive?: boolean }).isActive ?? true,
      }
    : null;

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!userRole) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(userRole);
    },
    [userRole]
  );

  const isOwner = hasRole("OWNER");
  const isAdmin = hasRole(["OWNER", "ADMIN"]);
  const isManager = hasRole(["OWNER", "ADMIN", "MANAGER"]);
  const isCashier = hasRole(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to logout");
    }
  }, [router]);

  return {
    user,
    session,
    status,
    isLoading,
    isAuthenticated,
    hasRole,
    isOwner,
    isAdmin,
    isManager,
    isCashier,
    logout,
  };
}