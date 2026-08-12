import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getCakeById,
  getCakeRatings,
  createRating,
} from "../services/api";

import { useCart } from "../context/CartContext";

function CakeDetails() {
  const { id } = useParams();

  const {
    addCakeToCart,
  } = useCart();

  const [cake, setCake] = useState(null);
  const [ratings, setRatings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Rating form
  const [selectedRating, setSelectedRating] =
    useState(0);

  const [comment, setComment] =
    useState("");

  const [submittingRating, setSubmittingRating] =
    useState(false);

  const [ratingSuccess, setRatingSuccess] =
    useState("");

  const [ratingError, setRatingError] =
    useState("");

  const [addingToCart, setAddingToCart] =
    useState(false);

  // ==========================================
  // LOAD CAKE + RATINGS
  // ==========================================

  const loadCakeDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const cakeData =
        await getCakeById(id);

      setCake(cakeData);

      const ratingsData =
        await getCakeRatings(id);

      setRatings(
        Array.isArray(ratingsData)
          ? ratingsData
          : []
      );
    } catch (err) {
      console.error(
        "Unable to load cake details:",
        err
      );

      setError(
        "Unable to load this cake. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCakeDetails();
  }, [id]);

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = async () => {
    if (!cake?.available || addingToCart) {
      return;
    }

    try {
      setAddingToCart(true);

      await addCakeToCart(
        cake.id,
        1
      );
    } catch (err) {
      console.error(
        "Unable to add cake to cart:",
        err
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // ==========================================
  // SUBMIT RATING
  // ==========================================

  const handleSubmitRating = async (event) => {
    event.preventDefault();

    setRatingSuccess("");
    setRatingError("");

    if (selectedRating === 0) {
      setRatingError(
        "Please select a rating from 1 to 5 stars."
      );
      return;
    }

    if (comment.length > 1000) {
      setRatingError(
        "Your review cannot exceed 1000 characters."
      );
      return;
    }

    try {
      setSubmittingRating(true);

      await createRating({
        userId: 101,
        cakeId: Number(id),
        rating: selectedRating,
        comment: comment.trim(),
      });

      setRatingSuccess(
        "Thank you! Your review has been submitted."
      );

      setSelectedRating(0);
      setComment("");

      // Reload ratings so the new review
      // appears immediately.
      const updatedRatings =
        await getCakeRatings(id);

      setRatings(
        Array.isArray(updatedRatings)
          ? updatedRatings
          : []
      );

    } catch (err) {
  console.error(
    "Unable to submit rating:",
    err
  );

  const message =
    err?.response?.status === 409
      ? "User has already rated this cake"
      : err?.response?.data?.message ||
        "Unable to submit your review. Please try again.";

  setRatingError(message);
} finally {
  setSubmittingRating(false);
}
};

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="page-message">
        <div className="loader"></div>

        <p>
          Preparing something sweet...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !cake) {
    return (
      <div className="page-message error">

        <div className="error-icon">
          !
        </div>

        <p>
          {error || "Cake not found."}
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
  // RATING SUMMARY
  // ==========================================

  const price =
    Number(cake.price || 0);

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce(
            (sum, rating) =>
              sum +
              Number(
                rating.rating || 0
              ),
            0
          ) / ratings.length
        ).toFixed(1)
      : "0.0";

  return (
    <main className="details-page">

      {/* ======================================
          TOP BAR
      ======================================= */}

      <div className="details-topbar">

        <Link
          to="/cakes"
          className="back-link"
        >
          ← Back to Cakes
        </Link>

      </div>


      {/* ======================================
          DETAILS
      ======================================= */}

      <section className="cake-details">

        {/* IMAGE */}

        <div className="details-image-container">

          <div className="details-image-placeholder">
            <span>
              🍰
            </span>
          </div>

          {cake.imageUrl && (
            <img
              src={cake.imageUrl}
              alt={cake.name}
              className="details-image"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          )}

          <span className="details-category">
            {cake.category}
          </span>

          {cake.available && (
            <span className="details-fresh">
              Fresh
            </span>
          )}

        </div>


        {/* CONTENT */}

        <div className="details-content">

          <p className="eyebrow">
            CAKE DELIGHT
          </p>

          <h1>
            {cake.name}
          </h1>


          {/* RATING */}

          <div className="details-rating">

            <span className="stars">
              ★★★★★
            </span>

            <strong>
              {averageRating}
            </strong>

            <span>
              {ratings.length}{" "}
              {ratings.length === 1
                ? "review"
                : "reviews"}
            </span>

          </div>


          {/* DESCRIPTION */}

          <p className="details-description">
            {cake.description}
          </p>


          {/* PRICE */}

          <div className="details-price">

            <small>
              STARTING FROM
            </small>

            <strong>
              ₹
              {price.toFixed(2)}
            </strong>

          </div>


          {/* AVAILABILITY */}

          <span
            className={`details-availability ${
              cake.available
                ? "available"
                : "unavailable"
            }`}
          >
            {cake.available
              ? "Available"
              : "Sold Out"}
          </span>


          {/* CART */}

          <button
            className="details-cart-button"
            disabled={
              !cake.available ||
              addingToCart
            }
            onClick={
              handleAddToCart
            }
          >
            {addingToCart
              ? "Adding..."
              : cake.available
              ? "Add to Cart"
              : "Currently Unavailable"}

            {cake.available &&
              !addingToCart && (
                <span>
                  +
                </span>
              )}
          </button>


          {/* BENEFITS */}

          <div className="details-benefits">

            <div>
              <span>✓</span>

              <div>
                <strong>
                  Premium Quality
                </strong>

                <small>
                  Carefully selected ingredients
                </small>
              </div>
            </div>


            <div>
              <span>♥</span>

              <div>
                <strong>
                  Freshly Prepared
                </strong>

                <small>
                  Made fresh for your celebration
                </small>
              </div>
            </div>


            <div>
              <span>★</span>

              <div>
                <strong>
                  Cake Delight Promise
                </strong>

                <small>
                  Quality you can taste
                </small>
              </div>
            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          REVIEWS
      ======================================= */}

      <section className="reviews-section">

        <div className="reviews-heading">

          <div>

            <p className="eyebrow">
              CUSTOMER LOVE
            </p>

            <h2>
              What people say
            </h2>

          </div>


          {ratings.length > 0 && (
            <div className="review-summary">

              <strong>
                {averageRating}
              </strong>

              <span>
                ★★★★★
              </span>

              <small>
                Based on {ratings.length}{" "}
                {ratings.length === 1
                  ? "review"
                  : "reviews"}
              </small>

            </div>
          )}

        </div>


        {/* ====================================
            GIVE RATING
        ===================================== */}

        <div className="rating-form-card">

          <div>

            <p className="eyebrow">
              SHARE YOUR EXPERIENCE
            </p>

            <h3>
              Rate this cake
            </h3>

            <p>
              Tell us what you thought
              about {cake.name}.
            </p>

          </div>


          <form
            onSubmit={handleSubmitRating}
            className="rating-form"
          >

            {/* STARS */}

            <div className="rating-selector">

              <span>
                Your rating
              </span>

              <div className="rating-stars-selector">

                {[1, 2, 3, 4, 5].map(
                  (star) => (

                    <button
                      key={star}
                      type="button"
                      className={
                        star <=
                        selectedRating
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setSelectedRating(
                          star
                        )
                      }
                      aria-label={`Rate ${star} out of 5`}
                    >
                      ★
                    </button>

                  )
                )}

              </div>

            </div>


            {/* COMMENT */}

            <div className="rating-comment">

              <label htmlFor="rating-comment">
                Your review
              </label>

              <textarea
                id="rating-comment"
                rows="5"
                maxLength="1000"
                value={comment}
                onChange={(event) =>
                  setComment(
                    event.target.value
                  )
                }
                placeholder="Share your experience with this cake..."
              />

              <div className="character-count">
                {comment.length}/1000
              </div>

            </div>


            {/* STATUS */}

            {ratingError && (
              <div className="rating-error">
                {ratingError}
              </div>
            )}

            {ratingSuccess && (
              <div className="rating-success">
                {ratingSuccess}
              </div>
            )}


            <button
              type="submit"
              className="submit-rating-button"
              disabled={
                submittingRating
              }
            >
              {submittingRating
                ? "Submitting..."
                : "Submit Review →"}
            </button>

          </form>

        </div>


        {/* ====================================
            EXISTING REVIEWS
        ===================================== */}

        {ratings.length > 0 ? (

          <div className="reviews-grid">

            {ratings.map(
              (rating) => (

                <article
                  className="review-card"
                  key={rating.id}
                >

                  <div className="review-top">

                    <div className="review-avatar">
                      C
                    </div>

                    <div>

                      <strong>
                        {rating.userName ||
                          `Customer #${
                            rating.userId ||
                            ""
                          }`}
                      </strong>

                      <small>
                        Verified customer
                      </small>

                    </div>

                    <span className="review-stars">
                      {"★".repeat(
                        Math.max(
                          0,
                          Math.min(
                            5,
                            Number(
                              rating.rating ||
                                0
                            )
                          )
                        )
                      )}
                    </span>

                  </div>

                  <p>
                    {rating.comment ||
                      "Loved this cake! It was fresh and delicious."}
                  </p>

                  {rating.createdAt && (
                    <span className="review-date">
                      {new Date(
                        rating.createdAt
                      ).toLocaleDateString()}
                    </span>
                  )}

                </article>

              )
            )}

          </div>

        ) : (

          <div className="no-reviews">

            <span>
              ★
            </span>

            <h3>
              No reviews yet
            </h3>

            <p>
              Be the first to share your
              experience with this cake.
            </p>

          </div>

        )}

      </section>

    </main>
  );
}

export default CakeDetails;