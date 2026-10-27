import type { UserRole } from "@/types/auth";

export function canAccessRoute(path: string, role?: UserRole) {
  if (!role) return false;
  const management = ["OWNER", "ADMIN", "MANAGER"].includes(role);
  const section = path.split("/")[1];
  if (path === "/shifts/reconciliation" || path.startsWith("/shifts/reconciliation/")) return management;
  if (["register", "settings"].includes(section))
    return role === "OWNER" || role === "ADMIN";
  if (
    [
      "reports",
      "expenses",
      "purchases",
      "employees",
      "ai-insights",
      "ui-showcase",
    ].includes(section)
  )
    return management;
  if (["pos", "sales", "customers", "shifts"].includes(section))
    return role !== "INVENTORY_STAFF";
  if (section === "inventory") return management || role === "INVENTORY_STAFF";
  if (
    section === "products" &&
    (path.endsWith("/add") || path.endsWith("/edit"))
  )
    return management || role === "INVENTORY_STAFF";
  if (
    ["brands", "categories", "suppliers"].includes(section) &&
    (path.endsWith("/add") || path.endsWith("/edit"))
  )
    return management;
  return true;
}
