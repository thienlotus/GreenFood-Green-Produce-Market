import { useCartStore } from './useCartStore';

export const clearCart = () => {
    useCartStore.getState().clearCart();
}
