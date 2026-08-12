import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getBasket,
  addToBasket,
  updateBasketItem,
  removeBasketItem,
  checkout,
} from "../services/api";

const CartContext = createContext(null);

// Temporary user until authentication is implemented.
const USER_ID = 101;

export function CartProvider({ children }) {
  const [basket, setBasket] = useState(null);

  const [loading, setLoading] = useState(false);

  const [cartError, setCartError] = useState("");

  // ==========================================
  // LOAD BASKET
  // ==========================================

  const loadBasket = async () => {
    try {
      setLoading(true);
      setCartError("");

      const data = await getBasket(USER_ID);

      setBasket(data);
    } catch (error) {
      console.error(
        "Unable to load basket:",
        error
      );

      setCartError(
        "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadBasket();
  }, []);

  // ==========================================
  // ADD CAKE
  // ==========================================

  const addCakeToCart = async (
    cakeId,
    quantity = 1
  ) => {
    try {
      setCartError("");

      const updatedBasket =
        await addToBasket(
          USER_ID,
          cakeId,
          quantity
        );

      setBasket(updatedBasket);

      return updatedBasket;
    } catch (error) {
      console.error(
        "Unable to add cake to cart:",
        error
      );

      setCartError(
        "Unable to add this cake to your cart."
      );

      throw error;
    }
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const updateCakeQuantity = async (
    itemId,
    quantity
  ) => {
    try {
      setCartError("");

      if (quantity < 1) {
        return;
      }

      const updatedBasket =
        await updateBasketItem(
          USER_ID,
          itemId,
          quantity
        );

      setBasket(updatedBasket);

      return updatedBasket;
    } catch (error) {
      console.error(
        "Unable to update basket item:",
        error
      );

      setCartError(
        "Unable to update item quantity."
      );

      throw error;
    }
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const removeCakeFromCart = async (
    itemId
  ) => {
    try {
      setCartError("");

      const updatedBasket =
        await removeBasketItem(
          USER_ID,
          itemId
        );

      setBasket(updatedBasket);

      return updatedBasket;
    } catch (error) {
      console.error(
        "Unable to remove item:",
        error
      );

      setCartError(
        "Unable to remove this item."
      );

      throw error;
    }
  };

  // ==========================================
  // CHECKOUT
  // ==========================================

  const checkoutCart = async () => {
    try {
      setCartError("");

      const order =
        await checkout(USER_ID);

      // Refresh basket after successful checkout
      await loadBasket();

      return order;
    } catch (error) {
      console.error(
        "Unable to checkout:",
        error
      );

      setCartError(
        "Unable to complete your order."
      );

      throw error;
    }
  };

  // ==========================================
  // CART DATA
  // ==========================================

  const cartItems =
    basket?.items || [];

  const cartCount =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );

  const cartTotal =
    Number(
      basket?.totalAmount || 0
    );

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {
    userId: USER_ID,

    basket,

    cartItems,

    cartCount,

    cartTotal,

    loading,

    cartError,

    addCakeToCart,

    updateCakeQuantity,

    removeCakeFromCart,

    checkoutCart,

    refreshCart: loadBasket,
  };

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

// ==========================================
// HOOK
// ==========================================

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}