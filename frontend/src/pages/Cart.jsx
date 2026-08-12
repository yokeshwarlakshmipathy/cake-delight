import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCakeById } from "../services/api";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    cartError,
    updateCakeQuantity,
    removeCakeFromCart,
    checkoutCart,
  } = useCart();

  const [cakeDetails, setCakeDetails] = useState({});
  const [loadingCakes, setLoadingCakes] = useState(true);

  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  // ==========================================
  // LOAD CAKE DETAILS
  // ==========================================

  useEffect(() => {
    const loadCakeDetails = async () => {
      if (!cartItems.length) {
        setCakeDetails({});
        setLoadingCakes(false);
        return;
      }

      try {
        setLoadingCakes(true);

        const results = await Promise.all(
          cartItems.map(async (item) => {
            try {
              const cake = await getCakeById(item.cakeId);
              return [item.cakeId, cake];
            } catch (error) {
              console.error(
                `Unable to load cake ${item.cakeId}:`,
                error
              );

              return [item.cakeId, null];
            }
          })
        );

        setCakeDetails(Object.fromEntries(results));
      } finally {
        setLoadingCakes(false);
      }
    };

    loadCakeDetails();
  }, [cartItems]);

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      setUpdatingItemId(item.id);

      await updateCakeQuantity(
        item.id,
        newQuantity
      );
    } catch (error) {
      console.error(
        "Unable to update quantity:",
        error
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const handleRemove = async (itemId) => {
    try {
      setRemovingItemId(itemId);

      await removeCakeFromCart(itemId);
    } catch (error) {
      console.error(
        "Unable to remove item:",
        error
      );
    } finally {
      setRemovingItemId(null);
    }
  };

  // ==========================================
  // CHECKOUT
  // ==========================================

  const handleCheckout = async () => {
    if (!cartItems.length || checkingOut) {
      return;
    }

    try {
      setCheckingOut(true);
      setCheckoutError("");
      setOrderSuccess(null);

      const order = await checkoutCart();

      console.log(
        "Checkout successful:",
        order
      );

      setOrderSuccess(order);
    } catch (error) {
      console.error(
        "Checkout failed:",
        error
      );

      setCheckoutError(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Unable to complete checkout. Please try again."
      );
    } finally {
      setCheckingOut(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading || loadingCakes) {
    return (
      <div className="page-message">
        <div className="loader"></div>

        <p>
          Loading your sweet cart...
        </p>
      </div>
    );
  }

  // ==========================================
  // ORDER SUCCESS
  // ==========================================

  if (orderSuccess) {
    return (
      <main className="cart-page">
        <section className="checkout-success">
          <div className="success-icon">
            ✓
          </div>

          <p className="eyebrow">
            CAKE DELIGHT
          </p>

          <h1>
            Order confirmed!
          </h1>

          <p>
            Thank you for your order.
            Your delicious cakes are being
            prepared with love.
          </p>

          <div className="order-summary-card">
            <span>
              Order number
            </span>

            <strong>
              #{orderSuccess.id}
            </strong>

            <span>
              Total
            </span>

            <strong>
              ₹
              {Number(
                orderSuccess.totalAmount || 0
              ).toFixed(2)}
            </strong>

            <span>
              Status
            </span>

            <strong>
              {orderSuccess.status}
            </strong>
          </div>

          <Link
            to="/cakes"
            className="primary-button"
          >
            Continue Shopping →
          </Link>
        </section>
      </main>
    );
  }

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (!cartItems.length) {
    return (
      <main className="cart-page">
        <section className="empty-cart">
          <div className="empty-cart-icon">
            🛒
          </div>

          <p className="eyebrow">
            CAKE DELIGHT
          </p>

          <h1>
            Your cart is empty.
          </h1>

          <p>
            Looks like you haven't added
            anything sweet yet.
          </p>

          <Link
            to="/cakes"
            className="primary-button"
          >
            Explore Cakes →
          </Link>
        </section>
      </main>
    );
  }

  // ==========================================
  // CART PAGE
  // ==========================================

  return (
    <main className="cart-page">

      <div className="cart-topbar">
        <Link
          to="/cakes"
          className="back-link"
        >
          ← Continue Shopping
        </Link>

        <div className="cart-count-label">
          <strong>
            {cartCount}
          </strong>

          <span>
            {cartCount === 1
              ? "item"
              : "items"}
          </span>
        </div>
      </div>

      <section className="cart-header">
        <p className="eyebrow">
          CAKE DELIGHT
        </p>

        <h1>
          Your sweet cart.
        </h1>

        <p>
          Everything you've chosen,
          ready for checkout.
        </p>
      </section>

      {(cartError || checkoutError) && (
        <div className="cart-error">
          {checkoutError || cartError}
        </div>
      )}

      <section className="cart-layout">

        {/* CART ITEMS */}

        <div className="cart-items">

          {cartItems.map((item) => {
            const cake =
              cakeDetails[item.cakeId];

            const quantity =
              Number(item.quantity || 0);

            const unitPrice =
              Number(item.unitPrice || 0);

            const subtotal =
              Number(
                item.subtotal ||
                  unitPrice * quantity
              );

            return (
              <article
                className="cart-item"
                key={item.id}
              >

                {/* IMAGE */}

                <Link
                  to={`/cakes/${item.cakeId}`}
                  className="cart-item-image"
                >
                  {cake?.imageUrl ? (
                    <img
                      src={cake.imageUrl}
                      alt={cake.name}
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <span>
                      🍰
                    </span>
                  )}
                </Link>

                {/* DETAILS */}

                <div className="cart-item-details">

                  <span className="cart-item-category">
                    {cake?.category || "Cake"}
                  </span>

                  <Link
                    to={`/cakes/${item.cakeId}`}
                    className="cart-item-name"
                  >
                    {cake?.name ||
                      `Cake #${item.cakeId}`}
                  </Link>

                  <p>
                    {cake?.description ||
                      "Delicious Cake Delight creation."}
                  </p>

                  <span className="cart-unit-price">
                    ₹
                    {unitPrice.toFixed(2)}
                    {" "}each
                  </span>

                </div>

                {/* QUANTITY */}

                <div className="cart-quantity">

                  <small>
                    Quantity
                  </small>

                  <div className="quantity-controls">

                    <button
                      type="button"
                      disabled={
                        updatingItemId === item.id ||
                        quantity <= 1
                      }
                      onClick={() =>
                        handleQuantityChange(
                          item,
                          quantity - 1
                        )
                      }
                    >
                      −
                    </button>

                    <strong>
                      {updatingItemId === item.id
                        ? "..."
                        : quantity}
                    </strong>

                    <button
                      type="button"
                      disabled={
                        updatingItemId === item.id
                      }
                      onClick={() =>
                        handleQuantityChange(
                          item,
                          quantity + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

                {/* SUBTOTAL */}

                <div className="cart-item-total">

                  <small>
                    Subtotal
                  </small>

                  <strong>
                    ₹
                    {subtotal.toFixed(2)}
                  </strong>

                  <button
                    type="button"
                    className="remove-button"
                    disabled={
                      removingItemId === item.id
                    }
                    onClick={() =>
                      handleRemove(item.id)
                    }
                  >
                    {removingItemId === item.id
                      ? "Removing..."
                      : "Remove"}
                  </button>

                </div>

              </article>
            );
          })}

        </div>

        {/* ORDER SUMMARY */}

        <aside className="cart-summary">

          <p className="eyebrow">
            ORDER SUMMARY
          </p>

          <h2>
            Your order
          </h2>

          <div className="summary-row">
            <span>
              Items
            </span>

            <strong>
              {cartCount}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Subtotal
            </span>

            <strong>
              ₹
              {cartTotal.toFixed(2)}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Delivery
            </span>

            <strong>
              FREE
            </strong>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total">
            <span>
              Total
            </span>

            <strong>
              ₹
              {cartTotal.toFixed(2)}
            </strong>
          </div>

          <button
            type="button"
            className="checkout-button"
            disabled={checkingOut}
            onClick={handleCheckout}
          >
            {checkingOut
              ? "Processing..."
              : "Proceed to Checkout"}

            {!checkingOut && (
              <span>
                →
              </span>
            )}
          </button>

          <div className="checkout-note">
            <span>
              ✓
            </span>

            <p>
              Secure checkout through
              Cake Delight.
            </p>
          </div>

        </aside>

      </section>
    </main>
  );
}

export default Cart;