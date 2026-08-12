import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getUserOrders,
  getCakeById,
} from "../services/api";

function Orders() {
  const USER_ID = 101;

  const [orders, setOrders] = useState([]);
  const [cakeDetails, setCakeDetails] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingCakes, setLoadingCakes] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD ORDERS
  // ==========================================

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getUserOrders(USER_ID);

        setOrders(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "Unable to load orders:",
          err
        );

        setError(
          "Unable to load your orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // ==========================================
  // LOAD CAKE DETAILS
  // ==========================================

  useEffect(() => {
    const loadCakeDetails = async () => {
      if (!orders.length) {
        setCakeDetails({});
        setLoadingCakes(false);
        return;
      }

      try {
        setLoadingCakes(true);

        // Collect unique cake IDs from all orders
        const cakeIds = [
          ...new Set(
            orders.flatMap((order) =>
              (order.items || []).map(
                (item) => item.cakeId
              )
            )
          ),
        ];

        const results =
          await Promise.all(
            cakeIds.map(async (cakeId) => {
              try {
                const cake =
                  await getCakeById(cakeId);

                return [
                  cakeId,
                  cake,
                ];
              } catch (err) {
                console.error(
                  `Unable to load cake ${cakeId}:`,
                  err
                );

                return [
                  cakeId,
                  null,
                ];
              }
            })
          );

        setCakeDetails(
          Object.fromEntries(results)
        );
      } finally {
        setLoadingCakes(false);
      }
    };

    loadCakeDetails();
  }, [orders]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading || loadingCakes) {
    return (
      <div className="page-message">
        <div className="loader"></div>

        <p>
          Loading your orders...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="page-message error">
        <div className="error-icon">
          !
        </div>

        <p>
          {error}
        </p>

        <Link
          to="/cakes"
          className="primary-button"
        >
          Back to Cakes
        </Link>
      </div>
    );
  }

  // ==========================================
  // EMPTY ORDERS
  // ==========================================

  if (orders.length === 0) {
    return (
      <main className="orders-page">

        <div className="orders-topbar">
          <Link
            to="/cakes"
            className="back-link"
          >
            ← Continue Shopping
          </Link>
        </div>

        <section className="empty-orders">

          <div className="empty-orders-icon">
            📦
          </div>

          <p className="eyebrow">
            NO ORDERS YET
          </p>

          <h2>
            Your order history is empty.
          </h2>

          <p>
            Explore our cakes and place your
            first order.
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
  // ORDERS PAGE
  // ==========================================

  return (
    <main className="orders-page">

      {/* TOP BAR */}

      <div className="orders-topbar">

        <Link
          to="/cakes"
          className="back-link"
        >
          ← Continue Shopping
        </Link>

        <span className="orders-count">
          {orders.length}{" "}
          {orders.length === 1
            ? "order"
            : "orders"}
        </span>

      </div>


      {/* HEADER */}

      <section className="orders-header">

        <p className="eyebrow">
          CAKE DELIGHT
        </p>

        <h1>
          My Orders
        </h1>

        <p>
          Keep track of your cake orders,
          purchases and order status.
        </p>

      </section>


      {/* ORDER LIST */}

      <section className="orders-list">

        {orders.map((order) => {

          const orderItems =
            order.items || [];

          const totalItems =
            orderItems.reduce(
              (sum, item) =>
                sum +
                Number(
                  item.quantity || 0
                ),
              0
            );

          return (
            <article
              className="order-card"
              key={order.id}
            >

              {/* HEADER */}

              <div className="order-card-header">

                <div>

                  <span className="order-label">
                    ORDER
                  </span>

                  <h2>
                    #{order.id}
                  </h2>

                </div>


                <span
                  className={`order-status ${
                    order.status ===
                    "COMPLETED"
                      ? "completed"
                      : ""
                  }`}
                >
                  {order.status}
                </span>

              </div>


              {/* DATE + TOTAL */}

              <div className="order-card-meta">

                <span>
                  {order.createdAt
                    ? new Date(
                        order.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "Date unavailable"}
                </span>

                <strong>
                  ₹
                  {Number(
                    order.totalAmount || 0
                  ).toFixed(2)}
                </strong>

              </div>


              {/* ITEMS */}

              <div className="order-items">

                {orderItems.map(
                  (item) => {

                    const cake =
                      cakeDetails[
                        item.cakeId
                      ];

                    const quantity =
                      Number(
                        item.quantity || 0
                      );

                    const unitPrice =
                      Number(
                        item.unitPrice || 0
                      );

                    const subtotal =
                      Number(
                        item.subtotal ||
                          unitPrice *
                            quantity
                      );

                    return (
                      <div
                        className="order-item"
                        key={item.id}
                      >

                        {/* CAKE INFO */}

                        <div className="order-item-main">

                          <div className="order-item-image">

                            {cake?.imageUrl ? (
                              <img
                                src={
                                  cake.imageUrl
                                }
                                alt={
                                  cake.name
                                }
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <span>
                                🍰
                              </span>
                            )}

                          </div>


                          <div className="order-item-info">

                            <Link
                              to={`/cakes/${item.cakeId}`}
                              className="order-item-name"
                            >
                              {cake?.name ||
                                `Cake #${item.cakeId}`}
                            </Link>

                            <small>
                              {quantity} × ₹
                              {unitPrice.toFixed(
                                2
                              )}
                            </small>

                            {cake?.category && (
                              <span className="order-item-category">
                                {cake.category}
                              </span>
                            )}

                          </div>

                        </div>


                        {/* SUBTOTAL */}

                        <strong className="order-item-subtotal">
                          ₹
                          {subtotal.toFixed(
                            2
                          )}
                        </strong>

                      </div>
                    );
                  }
                )}

              </div>


              {/* FOOTER */}

              <div className="order-card-footer">

  <span>
    {totalItems}{" "}
    {totalItems === 1
      ? "item"
      : "items"}
  </span>

  <div className="order-footer-actions">

    <div className="order-footer-total">

      <small>
        Order Total
      </small>

      <strong>
        ₹
        {Number(
          order.totalAmount || 0
        ).toFixed(2)}
      </strong>

    </div>

    <Link
      to={`/orders/${order.id}`}
      className="order-view-link"
    >
      View Order →
    </Link>

  </div>

</div>

            </article>
          );
        })}

      </section>

    </main>
  );
}

export default Orders;