import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }

    setLoading(true);

    try {
      const response = await api.get("/cart");
      setCart(response.data.cart);
    } catch (error) {
      console.error("Could not retrieve cart:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const response = await api.post("/cart", {
      productId,
      quantity,
    });

    setCart(response.data.cart);
  };

  const updateQuantity = async (productId, quantity) => {
    const response = await api.put(`/cart/${productId}`, {
      quantity,
    });

    setCart(response.data.cart);
  };

  const removeFromCart = async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    setCart(response.data.cart);
  };

  const clearCart = async () => {
    const response = await api.delete("/cart");
    setCart(response.data.cart || { items: [] });
  };

  const cartCount = cart.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const cartTotal = cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartTotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
