# Cake Delight - API Documentation

## 1. Overview

The Cake Delight backend exposes REST APIs through the API Gateway.

Base URL for local gateway access:

```text
http://127.0.0.1:8091
```

The API Gateway routes requests to the matching microservice.

| Service | Gateway Route | Internal Port |
| --- | --- | ---: |
| Catalog | `/api/cakes/**` | 8081 |
| Order / Basket | `/api/baskets/**` | 8082 |
| Order | `/api/orders/**` | 8082 |
| Rating | `/api/ratings/**` | 8083 |
| Notification | `/api/notifications/**` | 8084 |

## 2. Catalog Service APIs

### 2.1 Create Cake

`POST /api/cakes`

Request body:

```json
{
  "name": "Chocolate Truffle Cake",
  "description": "Rich chocolate cake with truffle frosting",
  "category": "Chocolate",
  "price": 899.00,
  "available": true,
  "imageUrl": "https://example.com/chocolate-truffle.jpg"
}
```

Response:

```http
201 Created
```

Returns the created cake record.

### 2.2 Get Cakes

`GET /api/cakes`

Returns all catalog records handled by the Catalog Service.

Optional query filters:

- `name`
- `category`
- `minPrice`
- `maxPrice`

Example:

```http
GET /api/cakes?name=chocolate&category=Chocolate&minPrice=600&maxPrice=1000
```

Filters can be used independently or together. The service combines supplied filters as a single JPA specification query.

### 2.3 Get Cake by ID

`GET /api/cakes/{id}`

Example:

```http
GET /api/cakes/1
```

Returns the selected cake.

### 2.4 Update Cake

`PUT /api/cakes/{id}`

Updates an existing cake.

### 2.5 Delete Cake

`DELETE /api/cakes/{id}`

Deletes a catalog record.

Response:

```http
204 No Content
```

## 3. Basket APIs

The basket APIs are provided by the Order Service.

### 3.1 Get Basket

`GET /api/baskets/{userId}`

Example:

```http
GET /api/baskets/101
```

Example response:

```json
{
  "id": 1,
  "userId": 101,
  "items": [
    {
      "id": 15,
      "cakeId": 1,
      "quantity": 2,
      "unitPrice": 899.00,
      "subtotal": 1798.00
    }
  ],
  "totalAmount": 1798.00
}
```

### 3.2 Add Cake to Basket

`POST /api/baskets/{userId}/items`

Example:

```http
POST /api/baskets/101/items
```

Request body:

```json
{
  "cakeId": 1,
  "quantity": 2
}
```

The service calculates the item subtotal and basket total.

### 3.3 Update Basket Item

`PUT /api/baskets/{userId}/items/{itemId}`

Request body:

```json
{
  "quantity": 3
}
```

The basket totals are recalculated after the quantity change.

### 3.4 Remove Basket Item

`DELETE /api/baskets/{userId}/items/{itemId}`

Removes the selected basket item and recalculates the basket total.

## 4. Order APIs

### 4.1 Checkout

`POST /api/orders/checkout`

Request body:

```json
{
  "userId": 101
}
```

Successful response:

```http
201 Created
```

Example response:

```json
{
  "id": 16,
  "userId": 101,
  "totalAmount": 3396.00,
  "status": "COMPLETED",
  "createdAt": "2026-08-12T08:42:05.193891",
  "items": [
    {
      "id": 16,
      "cakeId": 3,
      "quantity": 1,
      "unitPrice": 699.00,
      "subtotal": 699.00
    },
    {
      "id": 17,
      "cakeId": 1,
      "quantity": 3,
      "unitPrice": 899.00,
      "subtotal": 2697.00
    }
  ]
}
```

During checkout the Order Service:

- reads the user's basket
- validates that the basket is not empty
- creates the order and order items
- persists the order
- marks the order as completed
- publishes the order-completion event
- clears the basket after processing

### 4.2 Get Order by ID

`GET /api/orders/{orderId}`

Example:

```http
GET /api/orders/16
```

Returns the complete order and order items.

### 4.3 Get Orders by User

`GET /api/orders/user/{userId}`

Example:

```http
GET /api/orders/user/101
```

Returns the user's order history ordered by creation time, newest first.

## 5. Rating APIs

### 5.1 Create Rating

`POST /api/ratings`

Request body:

```json
{
  "userId": 101,
  "cakeId": 1,
  "rating": 5,
  "comment": "Fresh and delicious!"
}
```

Successful response:

```http
201 Created
```

Validation rules:

- `1 <= rating <= 5`
- comment length is limited to 1000 characters

### 5.2 Duplicate Rating

A user can only submit one rating for the same cake.

If the same user attempts to rate the same cake again, the service rejects the request and returns a conflict-style error.

### 5.3 Get Cake Ratings

`GET /api/ratings/cake/{cakeId}`

Example:

```http
GET /api/ratings/cake/1
```

Returns ratings and review comments for the selected cake.

### 5.4 Get Average Cake Rating

`GET /api/ratings/cake/{cakeId}/average`

Example:

```http
GET /api/ratings/cake/1/average
```

Returns the average rating and rating count.

## 6. Notification APIs

### 6.1 Create Order Confirmation

```http
POST /api/notifications/order-confirmation?userId={userId}&orderId={orderId}
```

Example:

```http
POST /api/notifications/order-confirmation?userId=101&orderId=16
```

#### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `userId` | Long | Yes | User receiving the notification |
| `orderId` | Long | Yes | Order associated with the notification |

Successful response:

```http
201 Created
```

The response contains the created notification:

```json
{
  "id": 14,
  "userId": 101,
  "orderId": 16,
  "type": "ORDER_CONFIRMATION",
  "message": "Your Cake Delight order #16 has been confirmed successfully.",
  "status": "SENT",
  "createdAt": "2026-08-12T08:42:05.193891"
}
```

Important: this implementation persists an in-app notification record in the Notification Service database and marks it as `SENT`. It does not implement external email or SMS delivery in this codebase.

The Notification Service also creates order-confirmation notifications automatically when it receives the order-completion event from RabbitMQ.

Other notification endpoints:

```http
GET /api/notifications/user/{userId}
GET /api/notifications/order/{orderId}
```

### 6.2 Get Notifications by User

`GET /api/notifications/user/{userId}`

Example:

```http
GET /api/notifications/user/101
```

Example response:

```json
[
  {
    "id": 14,
    "userId": 101,
    "orderId": 16,
    "type": "ORDER_CONFIRMATION",
    "message": "Your Cake Delight order #16 has been confirmed successfully.",
    "status": "SENT",
    "createdAt": "2026-08-12T08:42:05.193891"
  }
]
```

### 6.3 Get Notifications by Order

`GET /api/notifications/order/{orderId}`

Example:

```http
GET /api/notifications/order/16
```

Returns notifications associated with the selected order.

## 7. Health APIs

The backend services expose Spring Boot Actuator endpoints for operational health information.

The exposed management endpoints include:

- `/actuator/health`
- `/actuator/info`

These endpoints are used by Kubernetes health and readiness checks where applicable.

## 8. API Gateway Routing

The client should use the API Gateway as the primary HTTP entry point.

```text
Client
  ↓
API Gateway :8091
  ↓
Catalog / Order / Rating / Notification services
```

Gateway routes:

- `/api/cakes/**` → `catalog-service:8081`
- `/api/baskets/**` → `order-service:8082`
- `/api/orders/**` → `order-service:8082`
- `/api/ratings/**` → `rating-service:8083`
- `/api/notifications/**` → `notification-service:8084`

Clients should therefore not depend on internal pod IP addresses.

## 9. Representative End-to-End Flow

1. `GET /api/cakes`
2. `GET /api/cakes?category=Chocolate&minPrice=600&maxPrice=1000`
3. `POST /api/baskets/101/items`
4. `GET /api/baskets/101`
5. `POST /api/orders/checkout`
6. `GET /api/orders/{orderId}`
7. `GET /api/orders/user/101`
8. `POST /api/ratings`
9. `GET /api/ratings/cake/{cakeId}`
10. `GET /api/notifications/user/101`

## 10. Validation and Error Behavior

The application validates request data at service boundaries. Examples include:

- required cake name and category
- positive cake price
- rating between 1 and 5
- maximum review length
- non-empty basket for checkout
- duplicate rating prevention
- missing-resource handling

## 11. API Testing Notes

Representative verified operations include:

- `GET /api/cakes`
- `GET /api/orders/user/101`
- `GET /api/orders/{orderId}`
- `GET /api/notifications/user/101`
- `POST /api/orders/checkout`
- `POST /api/ratings`

The API layer supports the complete customer workflow from catalog browsing through checkout, order history, ratings, and notification retrieval.
