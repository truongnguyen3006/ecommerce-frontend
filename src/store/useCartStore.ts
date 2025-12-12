import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types'; // Import từ file types vừa sửa

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem, quantity: number) => void; // Nhận CartItem chuẩn
  removeFromCart: (skuCode: string) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (newItem: CartItem, quantity: number) => {
        const currentItems = get().items;
        // Kiểm tra trùng SKU (Ví dụ: Đã có Size 40 rồi thì cộng dồn)
        const existingItem = currentItems.find((i) => i.skuCode === newItem.skuCode);

        if (existingItem) {
          const newItems = currentItems.map((i) =>
            i.skuCode === newItem.skuCode
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
          set({ items: newItems });
        } else {
          // Ghi đè quantity bằng số lượng khách chọn mua
          set({ items: [...currentItems, { ...newItem, quantity: quantity }] });
        }
      },

      removeFromCart: (skuCode) => {
        set({ items: get().items.filter((i) => i.skuCode !== skuCode) });
      },

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'flash-sale-cart',
    }
  )
);