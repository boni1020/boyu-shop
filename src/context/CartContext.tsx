import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ProductVariant } from '../types';
import { getCartItemUnitPrice } from '../utils/priceUtils';

export const getCartItemId = (
  productId: string,
  selectedOptions?: Record<string, string>,
  selectedVariantId?: string
): string => {
  let id = productId;
  if (selectedVariantId) {
    id += `__v_${selectedVariantId}`;
  }
  if (selectedOptions && Object.keys(selectedOptions).length > 0) {
    const sortedPairs = Object.keys(selectedOptions)
      .sort()
      .map((k) => `${k}:${selectedOptions[k]}`)
      .join('|');
    id += `__${sortedPairs}`;
  }
  return id;
};

interface ToastFeedback {
  id: string;
  productName: string;
  quantity: number;
  imageUrl: string;
  selectedOptionsText?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedOptions?: Record<string, string>,
    selectedVariant?: ProductVariant
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartTotal: number;
  toast: ToastFeedback | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'boyu_cart_items_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure every item has a valid cartItemId
        return parsed.map((item: any) => ({
          ...item,
          cartItemId:
            item.cartItemId ||
            getCartItemId(
              item.product?.id || '',
              item.selectedOptions,
              item.selectedVariant?.id
            ),
        }));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    return [];
  });

  const [toast, setToast] = useState<ToastFeedback | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedOptions?: Record<string, string>,
    selectedVariant?: ProductVariant
  ) => {
    const addQty = Math.max(1, quantity);
    const cartItemId = getCartItemId(product.id, selectedOptions, selectedVariant?.id);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + addQty,
          selectedVariant: selectedVariant || updated[existingIndex].selectedVariant,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            cartItemId,
            product,
            quantity: addQty,
            selectedVariant: selectedVariant || undefined,
            selectedOptions:
              selectedOptions && Object.keys(selectedOptions).length > 0
                ? selectedOptions
                : undefined,
          },
        ];
      }
    });

    const parts: string[] = [];
    if (selectedVariant && selectedVariant.name) {
      parts.push(`規格: ${selectedVariant.name}`);
    }
    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
      Object.entries(selectedOptions).forEach(([k, v]) => {
        parts.push(`${k}: ${v}`);
      });
    }

    const optSummary = parts.length > 0 ? parts.join(' ∙ ') : undefined;

    // Trigger visual toast feedback
    setToast({
      id: `${cartItemId}-${Date.now()}`,
      productName: product.name,
      quantity: addQty,
      imageUrl: product.imageUrl,
      selectedOptionsText: optSummary,
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    // Quantity cannot be lower than 1
    const newQty = Math.max(1, quantity);
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const dismissToast = () => {
    setToast(null);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + getCartItemUnitPrice(item) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartItemCount,
        cartTotal,
        toast,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
