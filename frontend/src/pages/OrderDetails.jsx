import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getOrderById,
  getCakeById,
} from "../services/api";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [cakeDetails, setCakeDetails] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingCakes, setLoadingCakes] =
    useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD ORDER
  // ==========================================

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getOrderById(id);

        setOrder(data);
      } catch (err) {
        console.error(
          "Unable to load order:",
          err
        );

        setError(
          "Unable to load this order. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  // ==========================================
  // LOAD CAKE DETAILS
  // ==========================================

  useEffect(() => {
    const loadCakeDetails = async () => {
      if (!order?.items?.length) {
        setCakeDetails({});
        setLoadingCakes(false);
        return;
      }

      try {
        setLoadingCakes(true);

        const cakeIds = [
          ...new Set(
            order.items.map(
              (item) => item.cakeId
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
  }, [order]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading || loadingCakes) {
    return (
      <div className="page-message">
        <div className="loader"></div>

        <p>
          Loading your order...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !order) {
    return (
      <div className="page-message error">
        <div className="error-icon">
          !
        </div>

        <p>
          {error || "Order not found."}
        </p>

        <Link
          to="/orders"
          className="primary-button"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  // ==========================================
  // TOTAL ITEMS
  // ==========================================

  const totalItems =
    (order.items || []).reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0),
      0
    );

  return (
    <main className="order-details-page">

      {/* TOP BAR */}

      <div className="order-details-topbar">

        <Link
          to="/orders"
          className="back-link"
        >
          ← Back to My Orders
        </Link>

      </div>


      {/* HEADER */}

      <section className="order-details-header">

        <div>

          <p className="eyebrow">
            CAKE DELIGHT
          </p>

          <h1>
            Order #{order.id}
          </h1>

          <p>
            {order.createdAt
              ? new Date(
                  order.createdAt
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )
              : "Date unavailable"}
          </p>

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

      </section>


      {/* CONTENT */}

      <section className="order-details-layout">

        {/* ITEMS */}

        <div className="order-details-items">

          <div className="order-details-card">

            <div className="order-details-card-header">

              <div>

                <p className="eyebrow">
                  ORDER ITEMS
                </p>

                <h2>
                  Your cakes
                </h2>

              </div>

              <span>
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "items"}
              </span>

            </div>


            <div className="order-details-item-list">

              {(order.items || []).map(
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
                    <article
                      className="order-details-item"
                      key={item.id}
                    >

                      <div className="order-details-item-image">

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


                      <div className="order-details-item-info">

                        <Link
                          to={`/cakes/${item.cakeId}`}
                          className="order-details-item-name"
                        >
                          {cake?.name ||
                            `Cake #${item.cakeId}`}
                        </Link>

                        {cake?.category && (
                          <span className="order-details-category">
                            {cake.category}
                          </span>
                        )}

                        <small>
                          {quantity} × ₹
                          {unitPrice.toFixed(
                            2
                          )}
                        </small>

                      </div>


                      <strong>
                        ₹
                        {subtotal.toFixed(
                          2
                        )}
                      </strong>

                    </article>
                  );
                }
              )}

            </div>

          </div>

        </div>


        {/* SUMMARY */}

        <aside className="order-details-summary">

          <p className="eyebrow">
            ORDER SUMMARY
          </p>

          <h2>
            Your order
          </h2>

          <div className="order-summary-row">

            <span>
              Items
            </span>

            <strong>
              {totalItems}
            </strong>

          </div>


          <div className="order-summary-row">

            <span>
              Subtotal
            </span>

            <strong>
              ₹
              {Number(
                order.totalAmount || 0
              ).toFixed(2)}
            </strong>

          </div>


          <div className="order-summary-row">

            <span>
              Delivery
            </span>

            <strong>
              FREE
            </strong>

          </div>


          <div className="order-summary-divider"></div>


          <div className="order-summary-total">

            <span>
              Total
            </span>

            <strong>
              ₹
              {Number(
                order.totalAmount || 0
              ).toFixed(2)}
            </strong>

          </div>


          <div className="order-summary-status">

            <span>
              ✓
            </span>

            <div>

              <strong>
                Order {order.status}
              </strong>

              <small>
                Thank you for choosing
                Cake Delight.
              </small>

            </div>

          </div>


          <Link
            to="/cakes"
            className="primary-button order-shop-button"
          >
            Continue Shopping →
          </Link>

        </aside>

      </section>

    </main>
  );
}

export default OrderDetails;