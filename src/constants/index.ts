export const APP_NAME = "Upul Stores";
export const APP_VERSION = "1.0.0";

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
  INVENTORY_STAFF: "inventory_staff",
  OWNER: "owner",
} as const;

export const ORDER_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  ON_HOLD: "on_hold",
} as const;

export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  QR: "qr",
  GIFT_CARD: "gift_card",
} as const;

export const STOCK_STATUS = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
} as const;

export const SIDEBAR_WIDTH = "280px";
export const SIDEBAR_COLLAPSED_WIDTH = "80px";
export const NAVBAR_HEIGHT = "64px";

export const ITEMS_PER_PAGE = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const KEYBOARD_SHORTCUTS = {
  SEARCH: "Ctrl+K",
  NEW_SALE: "F2",
  HOLD_ORDER: "F3",
  PAYMENT: "F4",
  PRINT: "Ctrl+P",
  SETTINGS: "Ctrl+,",
} as const;