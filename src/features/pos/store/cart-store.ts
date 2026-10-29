import { create } from "zustand";
import { money } from "../utils/checkout";

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  discount: number;
  tax: number;
  total: number;
  maxStock: number;
}

export interface HeldOrder {
  id: string;
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  note: string;
  heldAt: string;
}

interface CartState {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  couponCode: string;
  couponDiscount: number;
  note: string;
  heldOrders: HeldOrder[];

  addItem: (item: Omit<CartItem, "total">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  setNote: (note: string) => void;
  holdOrder: () => void;
  resumeOrder: (orderId: string) => void;
  removeHeldOrder: (orderId: string) => void;

  getSubtotal: () => number;
  getTaxTotal: () => number;
  getDiscountTotal: () => number;
  getGrandTotal: () => number;
  getItemCount: () => number;
}

function calcItemTotal(item: Omit<CartItem, "total">): number {
  const base = money(item.price * item.quantity);
  const discountAmt = money((base * item.discount) / 100);
  const afterDiscount = base - discountAmt;
  const taxAmt = money((afterDiscount * item.tax) / 100);
  return money(afterDiscount + taxAmt);
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  customerName: null,
  couponCode: "",
  couponDiscount: 0,
  note: "",
  heldOrders: [],

  addItem: (item) => {
    if (
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0 ||
      item.maxStock <= 0
    )
      return;
    set({ couponCode: "", couponDiscount: 0 });
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);

      if (existing) {
        const newQty = Math.min(
          existing.quantity + item.quantity,
          item.maxStock,
        );
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? {
                  ...i,
                  quantity: newQty,
                  total: calcItemTotal({ ...i, quantity: newQty }),
                }
              : i,
          ),
        };
      }

      const newItem: CartItem = {
        ...item,
        quantity: Math.min(item.quantity, item.maxStock),
        total: calcItemTotal({
          ...item,
          quantity: Math.min(item.quantity, item.maxStock),
        }),
      };

      return { items: [...state.items, newItem] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      couponCode: "",
      couponDiscount: 0,
      items: state.items.filter((i) => i.productId !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (!Number.isSafeInteger(quantity)) return;
    set((state) => ({
      couponCode: "",
      couponDiscount: 0,
      items: state.items.map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity: Math.max(1, Math.min(quantity, i.maxStock)),
              total: calcItemTotal({
                ...i,
                quantity: Math.max(1, Math.min(quantity, i.maxStock)),
              }),
            }
          : i,
      ),
    }));
  },

  updateDiscount: (productId, discount) => {
    if (!Number.isFinite(discount)) return;
    set((state) => ({
      couponCode: "",
      couponDiscount: 0,
      items: state.items.map((i) =>
        i.productId === productId
          ? {
              ...i,
              discount: Math.max(0, Math.min(discount, 100)),
              total: calcItemTotal({
                ...i,
                discount: Math.max(0, Math.min(discount, 100)),
              }),
            }
          : i,
      ),
    }));
  },

  clearCart: () => {
    set({
      items: [],
      customerId: null,
      customerName: null,
      couponCode: "",
      couponDiscount: 0,
      note: "",
    });
  },

  setCustomer: (id, name) => {
    set({ customerId: id, customerName: name });
  },

  setCoupon: (code, discount) => {
    set({ couponCode: code, couponDiscount: discount });
  },

  clearCoupon: () => {
    set({ couponCode: "", couponDiscount: 0 });
  },

  setNote: (note) => {
    set({ note });
  },

  holdOrder: () => {
    const state = get();
    if (state.items.length === 0) return;

    const held: HeldOrder = {
      id: `HOLD-${crypto.randomUUID()}`,
      items: [...state.items],
      customerId: state.customerId,
      customerName: state.customerName,
      note: state.note,
      heldAt: new Date().toISOString(),
    };

    set((s) => ({
      heldOrders: [...s.heldOrders, held],
      items: [],
      customerId: null,
      customerName: null,
      couponCode: "",
      couponDiscount: 0,
      note: "",
    }));
  },

  resumeOrder: (orderId) => {
    const state = get();
    const order = state.heldOrders.find((o) => o.id === orderId);
    if (!order) return;
    // Preserve the current cart rather than silently replacing it when resuming.
    if (state.items.length > 0) get().holdOrder();

    set((s) => ({
      items: order.items,
      couponCode: "",
      couponDiscount: 0,
      customerId: order.customerId,
      customerName: order.customerName,
      note: order.note,
      heldOrders: s.heldOrders.filter((o) => o.id !== orderId),
    }));
  },

  removeHeldOrder: (orderId) => {
    set((s) => ({
      heldOrders: s.heldOrders.filter((o) => o.id !== orderId),
    }));
  },

  getSubtotal: () => {
    return money(
      get().items.reduce(
        (sum, item) => sum + money(item.price * item.quantity),
        0,
      ),
    );
  },

  getTaxTotal: () => {
    return money(
      get().items.reduce((sum, item) => {
        const base = money(item.price * item.quantity);
        const disc = money((base * item.discount) / 100);
        return sum + money(((base - disc) * item.tax) / 100);
      }, 0),
    );
  },

  getDiscountTotal: () => {
    const state = get();
    const itemDisc = state.items.reduce((sum, item) => {
      return (
        sum + money((money(item.price * item.quantity) * item.discount) / 100)
      );
    }, 0);
    return money(
      itemDisc +
        Math.min(state.couponDiscount, money(state.getSubtotal() - itemDisc)),
    );
  },

  getGrandTotal: () => {
    const state = get();
    const subtotal = state.getSubtotal();
    const tax = state.getTaxTotal();
    const discount = state.getDiscountTotal();
    return money(Math.max(0, subtotal + tax - discount));
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
