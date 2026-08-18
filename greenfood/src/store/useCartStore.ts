import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  variantId: string;
  unit: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(i => i.variantId === newItem.variantId);
    if (existingItem) {
      return {
        items: state.items.map(i => 
          i.variantId === newItem.variantId 
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        ),
        isOpen: true
      };
    }
    return { items: [...state.items, newItem], isOpen: true };
  }),
  removeItem: (variantId) => set((state) => ({
    items: state.items.filter(i => i.variantId !== variantId)
  })),
  updateQuantity: (variantId, quantity) => set((state) => ({
    items: state.items.map(i => 
      i.variantId === variantId ? { ...i, quantity } : i
    )
  })),
  clearCart: () => set({ items: [] })
}));
