import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getCakes,
  getCakeRatings,
} from "../services/api";

import { useCart } from "../context/CartContext";

// ==========================================
// LOCAL CAKE IMAGES
// ==========================================

import blackForestImage from "../assets/cakes/Black Forest.png";
import butterscotchImage from "../assets/cakes/Buttersctoch.png";
import chocolateTruffleImage from "../assets/cakes/chocotruffle.png";
import redVelvetImage from "../assets/cakes/Red Velvet.png";
import strawberryImage from "../assets/cakes/Strawberry.png";
import vanillaImage from "../assets/cakes/Vanilla.png";
import logoImage from "../assets/logo.png";
import heroImage from "../assets/hero.png";
function Cakes() {

  // ==========================================
  // CAKE IMAGE MAPPING
  // ==========================================

  const getCakeImage = (cakeName) => {
    const name = String(cakeName || "").toLowerCase();

    if (name.includes("black forest")) {
      return blackForestImage;
    }

    if (name.includes("butterscotch")) {
      return butterscotchImage;
    }

    if (
      name.includes("chocolate") ||
      name.includes("truffle") ||
      name.includes("chocotrufle")
    ) {
      return chocolateTruffleImage;
    }

    if (name.includes("red velvet")) {
      return redVelvetImage;
    }

    if (name.includes("strawberry")) {
      return strawberryImage;
    }

    if (name.includes("vanilla")) {
      return vanillaImage;
    }

    return null;
  };


  const [cakes, setCakes] = useState([]);
  const [ratings, setRatings] = useState({});

  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] =
    useState(true);

  const [error, setError] = useState("");


  // ==========================================
  // FILTER STATE
  // ==========================================

  const [searchName, setSearchName] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [minPrice, setMinPrice] =
    useState("");

  const [maxPrice, setMaxPrice] =
    useState("");

  const [appliedFilters, setAppliedFilters] =
    useState({
      name: "",
      category: "All",
      minPrice: "",
      maxPrice: "",
    });


  // ==========================================
  // CART
  // ==========================================

  const [addingCakeId, setAddingCakeId] =
    useState(null);

  const [addedCakeId, setAddedCakeId] =
    useState(null);

  const {
    addCakeToCart,
    cartCount,
  } = useCart();


  // ==========================================
  // LOAD CAKES FROM CATALOG SERVICE
  // ==========================================

  useEffect(() => {
    const loadCakes = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCakes(
          appliedFilters
        );

        setCakes(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "Unable to load cakes:",
          err
        );

        setError(
          "Unable to load cakes. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCakes();
  }, [appliedFilters]);


  // ==========================================
  // LOAD RATINGS
  // ==========================================

  useEffect(() => {
    if (!cakes.length) {
      setRatings({});
      setRatingsLoading(false);
      return;
    }

    const loadRatings = async () => {
      try {
        setRatingsLoading(true);

        const results =
          await Promise.all(
            cakes.map(async (cake) => {
              try {
                const data =
                  await getCakeRatings(
                    cake.id
                  );

                return [
                  cake.id,
                  Array.isArray(data)
                    ? data
                    : [],
                ];
              } catch (ratingError) {
                console.warn(
                  `Unable to load ratings for cake ${cake.id}:`,
                  ratingError
                );

                return [
                  cake.id,
                  [],
                ];
              }
            })
          );

        setRatings(
          Object.fromEntries(results)
        );
      } finally {
        setRatingsLoading(false);
      }
    };

    loadRatings();
  }, [cakes]);


  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        cakes.map(
          (cake) => cake.category
        )
      ),
    ];
  }, [cakes]);


  // ==========================================
  // RATING SUMMARY
  // ==========================================

  const getRatingSummary = (cakeId) => {
    const cakeRatings =
      ratings[cakeId] || [];

    if (!cakeRatings.length) {
      return {
        average: null,
        count: 0,
      };
    }

    const total =
      cakeRatings.reduce(
        (sum, rating) =>
          sum +
          Number(
            rating.rating || 0
          ),
        0
      );

    return {
      average: (
        total /
        cakeRatings.length
      ).toFixed(1),

      count:
        cakeRatings.length,
    };
  };


  // ==========================================
  // APPLY FILTERS
  // ==========================================

  const handleApplyFilters = (event) => {
    event.preventDefault();

    setAppliedFilters({
      name: searchName.trim(),
      category: selectedCategory,
      minPrice,
      maxPrice,
    });
  };


  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const handleClearFilters = () => {
    setSearchName("");
    setSelectedCategory("All");
    setMinPrice("");
    setMaxPrice("");

    setAppliedFilters({
      name: "",
      category: "All",
      minPrice: "",
      maxPrice: "",
    });
  };


  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = async (
    cake
  ) => {
    if (
      !cake.available ||
      addingCakeId !== null
    ) {
      return;
    }

    try {
      setAddingCakeId(cake.id);
      setAddedCakeId(null);

      await addCakeToCart(
        cake.id,
        1
      );

      setAddedCakeId(cake.id);

      setTimeout(() => {
        setAddedCakeId(null);
      }, 2000);

    } catch (err) {
      console.error(
        "Unable to add cake to cart:",
        err
      );

      alert(
        "Unable to add this cake to cart. Please try again."
      );
    } finally {
      setAddingCakeId(null);
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
          Finding the perfect cakes...
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

      </div>
    );
  }


  return (
    <main className="cakes-page">

      {/* ======================================
          NAVBAR
      ======================================= */}

      <header className="navbar">

        <Link
          to="/"
          className="brand"
        >

          <span className="brand-icon">
  <img
    src={logoImage}
    alt="Cake Delight"
  />
</span>

          <div>
            <strong>
              CAKE DELIGHT
            </strong>

            <small>
              BAKED WITH LOVE
            </small>
          </div>

        </Link>


        <nav>

          <Link
            to="/"
            className="active"
          >
            Home
          </Link>

          <a href="#collection">
            Cakes
          </a>

          <Link to="/orders">
            My Orders
          </Link>

          <a href="#about">
            About
          </a>

        </nav>


        <Link
          to="/cart"
          className="cart-button"
        >

          <span>
            🛒
          </span>

          Cart

          <b>
            {cartCount}
          </b>

        </Link>

      </header>


      {/* ======================================
          HERO
      ======================================= */}

      <section className="cakes-hero">

        <div className="hero-content">

          <p className="eyebrow">
            HANDCRAFTED • FRESH • DELICIOUS
          </p>

          <h1>
            Freshly made
            <span>
              {" "}happiness.
            </span>
          </h1>

          <p className="hero-description">
            Beautiful cakes baked with
            premium ingredients, made
            specially for your sweetest
            moments.
          </p>

          <div className="hero-actions">

            <a
              href="#collection"
              className="primary-button"
            >
              Explore Cakes
              <span>→</span>
            </a>

            <span className="hero-note">
  <img
    src={logoImage}
    alt=""
    className="hero-note-logo"
  />
  Freshly baked every day
</span>
          </div>

        </div>


        <div className="hero-decoration">

          <div className="hero-circle"></div>

          <div className="hero-cake">
  <img
    src={logoImage}
    alt="Cake Delight"
    className="hero-logo"
  />
</div>

          <div className="floating-card floating-card-one">

            <span>
              ✓
            </span>

            <div>

              <strong>
                Premium
              </strong>

              <small>
                Ingredients
              </small>

            </div>

          </div>


          <div className="floating-card floating-card-two">

            <span>
              ♥
            </span>

            <div>

              <strong>
                Made Fresh
              </strong>

              <small>
                Every morning
              </small>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          COLLECTION
      ======================================= */}

      <section
        className="cakes-section"
        id="collection"
      >

        <div className="section-top">

          <div>

            <p className="eyebrow">
              OUR COLLECTION
            </p>

            <h2>
              Choose your favourite
            </h2>

            <p className="section-description">
              Search, filter and find exactly
              the cake you're looking for.
            </p>

          </div>


          <div className="cake-count">

            <strong>
              {cakes.length}
            </strong>

            <span>
              matching cakes
            </span>

          </div>

        </div>


        {/* ====================================
            FILTER BAR
        ===================================== */}

        <form
          className="cake-filters"
          onSubmit={
            handleApplyFilters
          }
        >

          <div className="filter-field search-field">

            <label htmlFor="cake-search">
              Search by name
            </label>

            <input
              id="cake-search"
              type="text"
              value={searchName}
              onChange={(event) =>
                setSearchName(
                  event.target.value
                )
              }
              placeholder="e.g. Chocolate, Red Velvet..."
            />

          </div>


          <div className="filter-field">

            <label htmlFor="cake-category">
              Category
            </label>

            <select
              id="cake-category"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value
                )
              }
            >

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>

          </div>


          <div className="filter-field">

            <label htmlFor="min-price">
              Min Price
            </label>

            <input
              id="min-price"
              type="number"
              min="0"
              step="1"
              value={minPrice}
              onChange={(event) =>
                setMinPrice(
                  event.target.value
                )
              }
              placeholder="₹ Min"
            />

          </div>


          <div className="filter-field">

            <label htmlFor="max-price">
              Max Price
            </label>

            <input
              id="max-price"
              type="number"
              min="0"
              step="1"
              value={maxPrice}
              onChange={(event) =>
                setMaxPrice(
                  event.target.value
                )
              }
              placeholder="₹ Max"
            />

          </div>


          <div className="filter-actions">

            <button
              type="submit"
              className="filter-apply-button"
            >
              Search
            </button>

            <button
              type="button"
              className="filter-clear-button"
              onClick={
                handleClearFilters
              }
            >
              Clear
            </button>

          </div>

        </form>


        {/* ====================================
            ACTIVE FILTERS
        ===================================== */}

        {(appliedFilters.name ||
          appliedFilters.category !==
            "All" ||
          appliedFilters.minPrice ||
          appliedFilters.maxPrice) && (

          <div className="active-filters">

            <span>
              Active filters:
            </span>

            {appliedFilters.name && (
              <span className="filter-chip">
                Name: {appliedFilters.name}
              </span>
            )}

            {appliedFilters.category !==
              "All" && (
              <span className="filter-chip">
                Category:{" "}
                {appliedFilters.category}
              </span>
            )}

            {appliedFilters.minPrice && (
              <span className="filter-chip">
                Min: ₹
                {appliedFilters.minPrice}
              </span>
            )}

            {appliedFilters.maxPrice && (
              <span className="filter-chip">
                Max: ₹
                {appliedFilters.maxPrice}
              </span>
            )}

          </div>

        )}


        {/* ====================================
            CAKE GRID
        ===================================== */}

        <div className="cake-grid">

          {cakes.map((cake) => {

            const rating =
              getRatingSummary(
                cake.id
              );

            const cakeImage =
              getCakeImage(cake.name);

            return (
              <article
                className="cake-card"
                key={cake.id}
              >

                <Link
                  to={`/cakes/${cake.id}`}
                  className="cake-image"
                >

                  {/* LOCAL CAKE IMAGE */}

                  {cakeImage ? (
                    <img
                      src={cakeImage}
                      alt={cake.name}
                      className="cake-product-image"
                    />
                  ) : (
                    <div className="cake-placeholder">
  <img
    src={logoImage}
    alt="Cake Delight"
    className="cake-placeholder-logo"
  />
</div>
                  )}


                  <span className="category-badge">
                    {cake.category}
                  </span>


                  {cake.available && (
                    <span className="fresh-badge">
                      Fresh
                    </span>
                  )}

                </Link>


                <div className="cake-content">

                  {/* RATING */}

                  <div className="rating">

                    {ratingsLoading ? (

                      <small>
                        Loading ratings...
                      </small>

                    ) : rating.count > 0 ? (

                      <>
                        <span className="rating-stars">
                          ★★★★★
                        </span>

                        <strong>
                          {rating.average}
                        </strong>

                        <small>
                          ({rating.count}{" "}
                          {rating.count === 1
                            ? "review"
                            : "reviews"})
                        </small>
                      </>

                    ) : (

                      <span className="no-rating">
                        ☆ No reviews yet
                      </span>

                    )}

                  </div>


                  {/* TITLE */}

                  <Link
                    to={`/cakes/${cake.id}`}
                    className="cake-title-link"
                  >

                    <h3>
                      {cake.name}
                    </h3>

                  </Link>


                  {/* DESCRIPTION */}

                  <p>
                    {cake.description}
                  </p>


                  {/* PRICE + AVAILABILITY */}

                  <div className="cake-footer">

                    <div className="price-area">

                      <small>
                        Starting from
                      </small>

                      <strong>
                        ₹
                        {Number(
                          cake.price
                        ).toFixed(2)}
                      </strong>

                    </div>


                    <span
                      className={
                        cake.available
                          ? "availability available"
                          : "availability unavailable"
                      }
                    >
                      {cake.available
                        ? "Available"
                        : "Sold Out"}
                    </span>

                  </div>


                  {/* ADD TO CART */}

                  <button
                    type="button"
                    className={
                      addedCakeId ===
                      cake.id
                        ? "add-cart-button added"
                        : "add-cart-button"
                    }
                    disabled={
                      !cake.available ||
                      addingCakeId ===
                        cake.id
                    }
                    onClick={() =>
                      handleAddToCart(
                        cake
                      )
                    }
                  >

                    {!cake.available
                      ? "Unavailable"
                      : addingCakeId ===
                        cake.id
                      ? "Adding..."
                      : addedCakeId ===
                        cake.id
                      ? "Added to Cart ✓"
                      : "Add to Cart"}

                    {cake.available &&
                      addingCakeId !==
                        cake.id &&
                      addedCakeId !==
                        cake.id && (
                      <span>
                        +
                      </span>
                    )}

                  </button>

                </div>

              </article>
            );
          })}

        </div>


        {/* ====================================
            EMPTY RESULTS
        ===================================== */}

        {cakes.length === 0 && (
          <div className="empty-state">

            <strong>
              No cakes found
            </strong>

            <p>
              Try changing your search
              or price range.
            </p>

            <button
              type="button"
              className="filter-clear-button"
              onClick={
                handleClearFilters
              }
            >
              Clear Filters
            </button>

          </div>
        )}

      </section>


      {/* ======================================
          ABOUT
      ======================================= */}

      <section
        className="about-section"
        id="about"
      >

        <div className="about-card">

          <p className="eyebrow">
            WHY CAKE DELIGHT?
          </p>

          <h2>
            Every celebration
            <br />
            deserves something special.
          </h2>

          <p>
            We believe a great cake is
            more than dessert. It's the
            centrepiece of memories,
            celebrations, birthdays and
            little moments worth
            remembering.
          </p>

          <div className="about-features">

            <div>
              <span>
                ✓
              </span>

              <strong>
                Premium Quality
              </strong>

              <small>
                Carefully selected ingredients
              </small>
            </div>


            <div>
              <span>
                ♥
              </span>

              <strong>
                Made With Love
              </strong>

              <small>
                Freshly prepared for you
              </small>
            </div>


            <div>
              <span>
                ★
              </span>

              <strong>
                Fresh & Delicious
              </strong>

              <small>
                Quality you can taste
              </small>
            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          FOOTER
      ======================================= */}

      <footer className="footer">

        <div>

          <strong>
            CAKE DELIGHT
          </strong>

          <span>
            Freshly made happiness.
          </span>

        </div>

        <p>
          © 2026 Cake Delight. Made with ♥
        </p>

      </footer>

    </main>
  );
}

export default Cakes;