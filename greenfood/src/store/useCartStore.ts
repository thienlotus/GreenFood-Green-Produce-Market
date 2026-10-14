import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cleanVietnameseMojibake } from '@/data/vietnamAddress';
import { ALL_PRODUCTS } from '@/data/products';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  variantId: string;
  unit: string;
  price: number;
  quantity: number;
  image: string;
  farmer?: {
    id?: string;
    name?: string;
    farmName?: string;
    region?: string;
    ghn_shop_id?: number;
    ghn_province_id?: number;
    ghn_district_id?: number;
    ghn_ward_code?: string;
    ghn_address?: string;
    address?: string;
  };
}

/**
 * Tự động chuẩn hóa và chữa lành lỗi ký tự / phông chữ (Mojibake Healer)
 * Đảm bảo mọi sản phẩm hiển thị tiếng Việt chuẩn 100% và luôn gắn kèm Nông hộ & Shop GHN tương ứng
 */
export function sanitizeCartItem(item: CartItem): CartItem {
  if (!item) return item;
  
  // 1. Tìm thông tin chuẩn từ danh mục sản phẩm nếu có
  const canonical = ALL_PRODUCTS.find(p => p.slug === item.slug || p.id === item.id);
  let cleanName = item.name;
  let cleanUnit = item.unit;

  if (canonical) {
    cleanName = canonical.name;
    const variant = canonical.variants.find(v => v.id === item.variantId || v.unit === item.unit);
    if (variant) {
      cleanUnit = variant.unit;
    }
  }

  // 2. Chữa lành lỗi kép UTF-8 / Mojibake nếu còn sót
  cleanName = cleanVietnameseMojibake(cleanName);
  cleanUnit = cleanVietnameseMojibake(cleanUnit);

  const canonicalFarmer = canonical?.farmer;
  const mergedFarmer = {
    ...(canonicalFarmer || {}),
    ...(item.farmer || {}),
    ghn_shop_id: item.farmer?.ghn_shop_id || canonicalFarmer?.ghn_shop_id,
    ghn_district_id: item.farmer?.ghn_district_id || canonicalFarmer?.ghn_district_id,
    ghn_ward_code: item.farmer?.ghn_ward_code || canonicalFarmer?.ghn_ward_code,
    ghn_province_id: item.farmer?.ghn_province_id || canonicalFarmer?.ghn_province_id,
    ghn_address: item.farmer?.ghn_address || canonicalFarmer?.ghn_address,
    id: item.farmer?.id || canonicalFarmer?.id,
    name: item.farmer?.name || canonicalFarmer?.name,
  };

  return {
    ...item,
    name: cleanName,
    unit: cleanUnit,
    farmer: mergedFarmer,
  };
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

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (rawItem) => {
        const newItem = sanitizeCartItem(rawItem);
        set((state) => {
          const existingItem = state.items.find(i => i.variantId === newItem.variantId);
          if (existingItem) {
            return {
              items: state.items.map(i => 
                i.variantId === newItem.variantId 
                  ? { ...i, ...newItem, quantity: i.quantity + newItem.quantity }
                  : sanitizeCartItem(i)
              ),
              isOpen: true
            };
          }
          return { 
            items: [...state.items.map(sanitizeCartItem), newItem], 
            isOpen: true 
          };
        });
      },
      removeItem: (variantId) => set((state) => ({
        items: state.items.filter(i => i.variantId !== variantId)
      })),
      updateQuantity: (variantId, quantity) => set((state) => ({
        items: state.items.map(i => 
          i.variantId === variantId ? { ...sanitizeCartItem(i), quantity } : sanitizeCartItem(i)
        )
      })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'greenfood_cart_storage',
      partialize: (state) => ({ 
        items: (state.items || []).map(sanitizeCartItem) 
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.items)) {
          state.items = state.items.map(sanitizeCartItem);
        }
      }
    }
  )
);
