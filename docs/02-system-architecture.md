# Cake Delight - System Architecture

## 1. Architecture Overview

Cake Delight follows a cloud-native microservices architecture in which business capabilities are separated into independently deployable services.

The React frontend communicates with backend services through a single API Gateway. Backend services maintain separate business responsibilities and their own persistence layer.

The architecture also uses RabbitMQ for asynchronous communication between the Order Service and Notification Service.

## 2. High-Level Architecture

```text
                         ┌───────────────────────┐
                         │   React Frontend      │
                         │      Vite :5173       │
                         └───────────┬───────────┘
                                     │
                                     │ REST
                                     ▼
                         ┌───────────────────────┐
                         │      API Gateway      │
                         │        :8091          │
                         └───────────┬───────────┘
                                     │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
     ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
     │ Catalog Service │    │  Order Service │    │ Rating Service │
     │     :8081       │    │     :8082      │    │     :8083      │
     └───────┬────────┘    └───────┬────────┘    └───────┬────────┘
             │                     │                     │
             ▼                     ▼                     ▼
       catalog_db              order_db              rating_db
                                   │
                                   │ ORDER_COMPLETED
                                   ▼
                            ┌──────────────┐
                            │   RabbitMQ   │
                            └──────┬───────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ Notification       │
                         │ Service :8084      │
                         └─────────┬──────────┘
                                   │
                                   ▼
                          notification_db
```

## 3. Client Layer

The frontend is implemented using React and Vite.

The frontend provides the customer-facing workflow:

- Browse cakes
- Filter cakes
- View cake details
- Add cakes to the basket
- Modify basket quantities
- Remove basket items
- Checkout
- View order history
- View order details
- Submit ratings and reviews

The frontend communicates with the backend using REST APIs routed through the API Gateway.

## 4. API Gateway

The API Gateway runs on port `8091`.

It acts as the single HTTP entry point for backend requests and routes requests to the appropriate microservice.

### Gateway routes

| Route | Destination |
| --- | --- |
| `/api/cakes/**` | Catalog Service `:8081` |
| `/api/baskets/**` | Order Service `:8082` |
| `/api/orders/**` | Order Service `:8082` |
| `/api/ratings/**` | Rating Service `:8083` |
| `/api/notifications/**` | Notification Service `:8084` |

The gateway therefore separates the frontend from the internal service addresses.

## 5. Catalog Service

The Catalog Service runs on port `8081`.

### Responsibility

The service owns cake product information, including:

- name
- description
- category
- price
- availability
- image reference

### Supported operations

The service provides APIs to:

- create cakes
- retrieve cakes
- retrieve an individual cake
- filter cakes by name
- filter cakes by category
- filter cakes by price range

## 6. Order Service

The Order Service runs on port `8082`.

### Responsibility

The service owns basket operations and order creation.

It manages:

- basket creation and retrieval
- adding basket items
- updating quantities
- removing items
- calculating totals
- checkout and order persistence
- publishing order-completion events

## 7. Rating Service

The Rating Service runs on port `8083`.

### Responsibility

The service owns cake rating data and summary calculations.

It exposes APIs to:

- submit ratings
- retrieve ratings for a cake
- compute the average rating
- reject duplicate ratings for the same user and cake

## 8. Notification Service

The Notification Service runs on port `8084`.

### Responsibility

The service owns notification persistence and processing.

It listens for order-completion events from RabbitMQ, creates an order-confirmation notification, and stores the record in its own database.

## 9. Data Ownership

Each service owns its own database and keeps its own domain data:

- Catalog Service → `catalog_db`
- Order Service → `order_db`
- Rating Service → `rating_db`
- Notification Service → `notification_db`

This aligns with the microservice design objective of service-owned persistence and clear business boundaries.
