# Cake Delight - Project Overview

## 1. Project Title

**Cake Delight - Cloud Native Microservices Application**

## 2. Introduction

Cake Delight is a cloud-native microservices-based application designed to provide an end-to-end online cake ordering experience.

The application allows customers to browse cakes, filter products, view cake details, add cakes to a basket, modify basket contents, complete checkout, view order history, view order details, submit ratings and reviews, and receive order confirmation notifications.

The solution demonstrates independent microservice deployment, REST-based communication, event-driven messaging, containerization, database-backed persistence, and Kubernetes orchestration.

## 3. Problem Statement

The objective is to design and develop a cloud-native application that separates major business capabilities into independently deployable services while still providing a complete customer journey.

The application must support:

- Cake catalog browsing
- Product filtering
- Shopping basket management
- Checkout and order creation
- Cake ratings and reviews
- Order confirmation notifications
- Containerized services
- Kubernetes-based deployment
- Event-driven communication

## 4. Project Objectives

The project demonstrates the following engineering capabilities:

1. Designing business capabilities using a microservices architecture.
2. Separating catalog, order, rating, and notification responsibilities.
3. Providing REST APIs through an API Gateway.
4. Using RabbitMQ for asynchronous order-completion events.
5. Persisting service-specific data in separate databases.
6. Containerizing services using Docker.
7. Deploying and managing services using Kubernetes.
8. Applying health checks and service discovery.
9. Providing a complete customer-facing frontend workflow.

## 5. Functional Scope

### 5.1 Cake Catalog

Customers can:

- Browse available cakes.
- View cake details.
- Filter cakes by name.
- Filter cakes by category.
- Filter cakes using minimum and maximum price.
- View product availability and pricing.

### 5.2 Shopping Basket

Customers can:

- Add cakes to the basket.
- Increase or decrease quantities.
- Remove items.
- View basket totals.

### 5.3 Checkout

Customers can:

- Review the basket.
- Complete checkout.
- Create an order.
- Receive an order confirmation result.
- View the generated order in order history.

### 5.4 Ratings and Reviews

Customers can:

- View ratings for a cake.
- View the average rating.
- Submit a rating from 1 to 5.
- Submit an optional review comment.
- Receive a clear duplicate-rating response when the same user attempts to rate the same cake again.

### 5.5 Order History

Customers can:

- View previous orders.
- View order status.
- View order totals.
- View individual cake items.
- Open a detailed order view.

### 5.6 Notifications

After successful checkout:

1. The Order Service publishes an order-completion event.
2. RabbitMQ transports the event.
3. The Notification Service consumes the event.
4. An order-confirmation notification is stored.
5. The notification is marked as `SENT`.

## 6. Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite |
| API Gateway | Spring Cloud Gateway |
| Backend | Spring Boot |
| Service Communication | REST + RabbitMQ |
| Databases | PostgreSQL |
| Containerization | Docker |
| Orchestration | Kubernetes |
| Build Tool | Maven |
| Test Support | Spring Boot Test |

## 7. Summary

Cake Delight is designed to demonstrate a complete cloud-native workflow from browsing cakes to receiving confirmation after checkout. The system is organized into separate microservices with clear ownership boundaries, asynchronous messaging for notifications, and container-based deployment support.
