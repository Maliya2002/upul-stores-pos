import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tags,
  Truck,
  Users,
  Warehouse,
  ShoppingCart,
  Receipt,
  ShoppingBag,
  Wallet,
  UserCog,
  BarChart3,
  Settings,
  Bell,
  Brain,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Product Management",
    items: [
      {
        title: "Products",
        href: "/products",
        icon: Package,
        children: [
          { title: "All Products", href: "/products", icon: Package },
          { title: "Add Product", href: "/products/add", icon: Package },
        ],
      },
      {
        title: "Categories",
        href: "/categories",
        icon: FolderTree,
      },
      {
        title: "Brands",
        href: "/brands",
        icon: Tags,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        title: "Suppliers",
        href: "/suppliers",
        icon: Truck,
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
      },
      {
        title: "Employees",
        href: "/employees",
        icon: UserCog,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "POS",
        href: "/pos",
        icon: ShoppingCart,
        badge: "Live",
      },
      {
        title: "Inventory",
        href: "/inventory",
        icon: Warehouse,
      },
      {
        title: "Sales",
        href: "/sales",
        icon: Receipt,
      },
      {
        title: "Purchases",
        href: "/purchases",
        icon: ShoppingBag,
      },
      {
        title: "Expenses",
        href: "/expenses",
        icon: Wallet,
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart3,
      },
      {
        title: "AI Insights",
        href: "/ai-insights",
        icon: Brain,
        badge: "New",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Notifications",
        href: "/notifications",
        icon: Bell,
        badge: "3",
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];