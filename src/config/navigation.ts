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
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  PackageX,
  Clock,
  Plus,
  List,
  Store,
  Database,
  Monitor,
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
          { title: "All Products", href: "/products", icon: List },
          { title: "Add Product", href: "/products/add", icon: Plus },
        ],
      },
      {
        title: "Categories",
        href: "/categories",
        icon: FolderTree,
        children: [
          { title: "All Categories", href: "/categories", icon: List },
          { title: "Add Category", href: "/categories/add", icon: Plus },
        ],
      },
      {
        title: "Brands",
        href: "/brands",
        icon: Tags,
        children: [
          { title: "All Brands", href: "/brands", icon: List },
          { title: "Add Brand", href: "/brands/add", icon: Plus },
        ],
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
        children: [
          { title: "All Suppliers", href: "/suppliers", icon: List },
          { title: "Add Supplier", href: "/suppliers/add", icon: Plus },
        ],
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
        children: [
          { title: "All Customers", href: "/customers", icon: List },
          { title: "Add Customer", href: "/customers/add", icon: Plus },
        ],
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
        title: "POS Billing",
        href: "/pos",
        icon: ShoppingCart,
        badge: "Live",
      },
      {
        title: "Inventory",
        href: "/inventory",
        icon: Warehouse,
        children: [
          { title: "Overview", href: "/inventory", icon: Warehouse },
          { title: "Stock In", href: "/inventory/stock-in", icon: ArrowDownToLine },
          { title: "Stock Out", href: "/inventory/stock-out", icon: ArrowUpFromLine },
          { title: "Movements", href: "/inventory/movements", icon: History },
          { title: "Expired", href: "/inventory/expired", icon: Clock },
        ],
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
        children: [
          { title: "All Purchases", href: "/purchases", icon: List },
          { title: "New Purchase", href: "/purchases/add", icon: Plus },
        ],
      },
      {
        title: "Expenses",
        href: "/expenses",
        icon: Wallet,
        children: [
          { title: "All Expenses", href: "/expenses", icon: List },
          { title: "Add Expense", href: "/expenses/add", icon: Plus },
        ],
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
        badge: "AI",
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
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        children: [
          { title: "Store Profile", href: "/settings", icon: Store },
          { title: "Store Details", href: "/settings/store", icon: Store },
          { title: "Receipt Design", href: "/settings/receipt", icon: Receipt },
          { title: "Backup", href: "/settings/backup", icon: Database },
          { title: "System Info", href: "/settings/system", icon: Monitor },
        ],
      },
    ],
  },
];