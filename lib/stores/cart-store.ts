import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

function generateCartItemId(productId: string, size: string): string {
  return `${productId}-${size}`;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const id = generateCartItemId(item.productId, item.size);
        const existingItem = get().items.find((i) => i.id === id);

        if (existingItem) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, id }],
          }));
        }
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "kickszone-cart",
    }
  )
);

