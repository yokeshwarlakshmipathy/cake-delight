import axios from "axios";

const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});


// =========================
// CAKES
// =========================

export const getCakes = async (filters = {}) => {
  const params = {};

  if (filters.name?.trim()) {
    params.name = filters.name.trim();
  }

  if (filters.category && filters.category !== "All") {
    params.category = filters.category;
  }

  if (
    filters.minPrice !== "" &&
    filters.minPrice !== null &&
    filters.minPrice !== undefined
  ) {
    params.minPrice = filters.minPrice;
  }

  if (
    filters.maxPrice !== "" &&
    filters.maxPrice !== null &&
    filters.maxPrice !== undefined
  ) {
    params.maxPrice = filters.maxPrice;
  }

  const response = await api.get(
    "/api/cakes",
    { params }
  );

  return response.data;
};

export const getCakeById = async (id) => {
  const response = await api.get(`/api/cakes/${id}`);
  return response.data;
};


// =========================
// RATINGS
// =========================

export const getCakeRatings = async (cakeId) => {
  const response = await api.get(
    `/api/ratings/cake/${cakeId}`
  );

  return response.data;
};
export const createRating = async ({
  userId,
  cakeId,
  rating,
  comment,
}) => {
  const response = await api.post(
    "/api/ratings",
    {
      userId,
      cakeId,
      rating,
      comment,
    }
  );

  return response.data;
};

// =========================
// BASKET
// =========================

export const getBasket = async (userId) => {
  const response = await api.get(
    `/api/baskets/${userId}`
  );

  return response.data;
};


export const addToBasket = async (
  userId,
  cakeId,
  quantity = 1
) => {
  const response = await api.post(
    `/api/baskets/${userId}/items`,
    {
      cakeId,
      quantity,
    }
  );

  return response.data;
};


export const updateBasketItem = async (
  userId,
  itemId,
  quantity
) => {
  const response = await api.put(
    `/api/baskets/${userId}/items/${itemId}`,
    {
      quantity,
    }
  );

  return response.data;
};


export const removeBasketItem = async (
  userId,
  itemId
) => {
  const response = await api.delete(
    `/api/baskets/${userId}/items/${itemId}`
  );

  return response.data;
};


// =========================
// CHECKOUT
// =========================

export const checkout = async (userId) => {
  const response = await api.post(
    "/api/orders/checkout",
    {
      userId,
    }
  );

  return response.data;
};

export const getUserOrders = async (userId) => {
  const response = await api.get(
    `/api/orders/user/${userId}`
  );

  return response.data;
};
export const getOrderById = async (orderId) => {
  const response = await api.get(
    `/api/orders/${orderId}`
  );

  return response.data;
};
export default api;