import { create } from "zustand";

export interface Discount {
  type: "percentage" | "amount" | "preset";
  value: number;
  presetId?: string;
  label?: string;
  amount: number;
}

export interface BillItem {
  itemId: string;
  name: string;
  unitPrice: number;
  buyingPrice: number;
  marketPrice?: number; // ← ADD
  quantity: number;
  stock: number;
  discount?: Discount;
  lineTotal: number;
  profit: number;
}

export interface SelectedCustomer {
  id: string;
  name: string;
  phone?: string;
  whatsappNumber?: string;
  points: number;
}

interface BillingState {
  items: BillItem[];
  customer: SelectedCustomer | null;
  loyaltyCoinsToUse: number;
  note: string;
  activeTab: "quick_sale" | "pre_order";
  focusItemId: string | null;
  preOrder: {
    orderDate: string;
    deliveryDate: string;
    advancePayment: string;
    advanceType: string;
    designNotes: string;
    note: string;
  };

  // Actions
  addItem: (item: Omit<BillItem, "lineTotal" | "profit">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  applyDiscount: (itemId: string, discount: Discount) => void;
  removeDiscount: (itemId: string) => void;
  setCustomer: (customer: SelectedCustomer | null) => void;
  setLoyaltyCoins: (coins: number) => void;
  setNote: (note: string) => void;
  setActiveTab: (tab: "quick_sale" | "pre_order") => void;
  setFocusItemId: (itemId: string | null) => void;
  setPreOrder: (data: Partial<BillingState["preOrder"]>) => void;
  clearBill: () => void;

  // Computed
  getSubtotal: () => number;
  getTotalDiscount: () => number;
  getLoyaltyDiscount: () => number;
  getTotal: () => number;
  getTotalProfit: () => number;
}

function computeLineTotal(item: Omit<BillItem, "lineTotal" | "profit">): {
  lineTotal: number;
  profit: number;
} {
  const gross = item.unitPrice * item.quantity;
  const discountAmount = item.discount?.amount ?? 0;
  const lineTotal = Math.max(0, gross - discountAmount);
  const profit =
    (item.unitPrice - item.buyingPrice) * item.quantity - discountAmount;
  return { lineTotal, profit };
}

export const useBillingStore = create<BillingState>((set, get) => ({
  items: [],
  customer: null,
  loyaltyCoinsToUse: 0,
  note: "",
  activeTab: "quick_sale",
  focusItemId: null,
  preOrder: {
    orderDate: "" as string,
    deliveryDate: "" as string,
    advancePayment: "" as string,
    advanceType: "" as string,
    designNotes: "" as string,
    note: "" as string,
  },

  addItem: (newItem) => {
    set((state) => {
      const existing = state.items.find((i) => i.itemId === newItem.itemId);
      if (existing) {
        // Increase quantity
        const updated = state.items.map((i) => {
          if (i.itemId !== newItem.itemId) return i;
          const quantity = i.quantity + 1;
          const discount = i.discount
            ? {
                ...i.discount,
                amount:
                  i.discount.type === "percentage"
                    ? (i.unitPrice * quantity * i.discount.value) / 100
                    : i.discount.amount,
              }
            : undefined;
          const { lineTotal, profit } = computeLineTotal({
            ...i,
            quantity,
            discount,
          });
          return { ...i, quantity, discount, lineTotal, profit };
        });
        return { items: updated };
      }
      // Add new
      const { lineTotal, profit } = computeLineTotal(newItem);
      return { items: [...state.items, { ...newItem, lineTotal, profit }] };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({ items: state.items.filter((i) => i.itemId !== itemId) }));
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity < 1) return;
    set((state) => ({
      items: state.items.map((i) => {
        if (i.itemId !== itemId) return i;
        const discount = i.discount
          ? {
              ...i.discount,
              amount:
                i.discount.type === "percentage"
                  ? (i.unitPrice * quantity * i.discount.value) / 100
                  : i.discount.amount,
            }
          : undefined;
        const { lineTotal, profit } = computeLineTotal({
          ...i,
          quantity,
          discount,
        });
        return { ...i, quantity, discount, lineTotal, profit };
      }),
    }));
  },

  applyDiscount: (itemId, discount) => {
    set((state) => ({
      items: state.items.map((i) => {
        if (i.itemId !== itemId) return i;
        const { lineTotal, profit } = computeLineTotal({ ...i, discount });
        return { ...i, discount, lineTotal, profit };
      }),
    }));
  },

  removeDiscount: (itemId) => {
    set((state) => ({
      items: state.items.map((i) => {
        if (i.itemId !== itemId) return i;
        const { lineTotal, profit } = computeLineTotal({
          ...i,
          discount: undefined,
        });
        return { ...i, discount: undefined, lineTotal, profit };
      }),
    }));
  },

  setCustomer: (customer) => set({ customer, loyaltyCoinsToUse: 0 }),
  setLoyaltyCoins: (coins) => set({ loyaltyCoinsToUse: coins }),
  setNote: (note) => set({ note }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFocusItemId: (itemId) => set({ focusItemId: itemId }),
  setPreOrder: (data) => set((s) => ({ preOrder: { ...s.preOrder, ...data } })),

  clearBill: () =>
    set({
      items: [],
      customer: null,
      loyaltyCoinsToUse: 0,
      note: "",
      focusItemId: null,
      preOrder: {
        orderDate: "",
        deliveryDate: "",
        advancePayment: "",
        advanceType: "",
        designNotes: "",
        note: "",
      },
    }),

  getSubtotal: () => {
    return get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  },

  getTotalDiscount: () => {
    return get().items.reduce((sum, i) => sum + (i.discount?.amount ?? 0), 0);
  },

  getLoyaltyDiscount: () => get().loyaltyCoinsToUse,

  getTotal: () => {
    const state = get();
    const subtotal = state.getSubtotal();
    const discount = state.getTotalDiscount();
    const loyalty = state.getLoyaltyDiscount();
    return Math.max(0, subtotal - discount - loyalty);
  },

  getTotalProfit: () => {
    return get().items.reduce((sum, i) => sum + i.profit, 0);
  },
}));
