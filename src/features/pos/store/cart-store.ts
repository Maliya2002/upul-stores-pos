import { create } from "zustand";

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
  const base = item.price * item.quantity;
  const discountAmt = (base * item.discount) / 100;
  const afterDiscount = base - discountAmt;
  const taxAmt = (afterDiscount * item.tax) / 100;
  return afterDiscount + taxAmt;
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
    set((state) => {
      const existing = state.items.find(
        (i) => i.productId === item.productId
      );

      if (existing) {
        const newQty = Math.min(
          existing.quantity + item.quantity,
          item.maxStock
        );
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? {
                  ...i,
                  quantity: newQty,
                  total: calcItemTotal({ ...i, quantity: newQty }),
                }
              : i
          ),
        };
      }

      const newItem: CartItem = {
        ...item,
        total: calcItemTotal(item),
      };

      return { items: [...state.items, newItem] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    set((state) => ({
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
          : i
      ),
    }));
  },

  updateDiscount: (productId, discount) => {
    set((state) => ({
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
          : i
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
      id: `HOLD-${Date.now()}`,
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

    set((s) => ({
      items: order.items,
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
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },

  getTaxTotal: () => {
    return get().items.reduce((sum, item) => {
      const base = item.price * item.quantity;
      const disc = (base * item.discount) / 100;
      return sum + ((base - disc) * item.tax) / 100;
    }, 0);
  },

  getDiscountTotal: () => {
    const state = get();
    const itemDisc = state.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity * item.discount) / 100;
    }, 0);
    return itemDisc + state.couponDiscount;
  },

  getGrandTotal: () => {
    const state = get();
    const subtotal = state.getSubtotal();
    const tax = state.getTaxTotal();
    const discount = state.getDiscountTotal();
    return Math.max(0, subtotal + tax - discount);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));