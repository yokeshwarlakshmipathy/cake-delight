\# Cake Delight - System Architecture



\## 1. Architecture Overview



Cake Delight follows a cloud-native microservices architecture in which business capabilities are separated into independently deployable services.



The React frontend communicates with backend services through a single API Gateway. Backend services maintain separate business responsibilities and database persistence.



The architecture also uses RabbitMQ for asynchronous communication between the Order Service and Notification Service.



\## 2. High-Level Architecture



```text

&#x20;                        ┌───────────────────────┐

&#x20;                        │   React Frontend      │

&#x20;                        │      Vite :5173       │

&#x20;                        └───────────┬───────────┘

&#x20;                                    │

&#x20;                                    │ REST

&#x20;                                    ▼

&#x20;                        ┌───────────────────────┐

&#x20;                        │      API Gateway      │

&#x20;                        │        :8091          │

&#x20;                        └───────────┬───────────┘

&#x20;                                    │

&#x20;             ┌──────────────────────┼──────────────────────┐

&#x20;             │                      │                      │

&#x20;             ▼                      ▼                      ▼

&#x20;    ┌────────────────┐    ┌────────────────┐    ┌────────────────┐

&#x20;    │ Catalog Service │    │  Order Service │    │ Rating Service │

&#x20;    │     :8081       │    │     :8082      │    │     :8083      │

&#x20;    └───────┬────────┘    └───────┬────────┘    └───────┬────────┘

&#x20;            │                     │                     │

&#x20;            ▼                     ▼                     ▼

&#x20;      catalog\_db              order\_db              rating\_db

&#x20;                                  │

&#x20;                                  │ ORDER\_COMPLETED

&#x20;                                  ▼

&#x20;                           ┌──────────────┐

&#x20;                           │   RabbitMQ   │

&#x20;                           └──────┬───────┘

&#x20;                                  │

&#x20;                                  ▼

&#x20;                        ┌────────────────────┐

&#x20;                        │ Notification       │

&#x20;                        │ Service :8084      │

&#x20;                        └─────────┬──────────┘

&#x20;                                  │

&#x20;                                  ▼

&#x20;                          notification\_db





3\. Client Layer



The frontend is implemented using React and Vite.



The frontend provides the customer-facing workflow:



Browse cakes

Filter cakes

View cake details

Add cakes to the basket

Modify basket quantities

Remove basket items

Checkout

View order history

View order details

Submit ratings and reviews



The frontend communicates with the backend using REST APIs.



4\. API Gateway



The API Gateway runs on port 8091.



It acts as the single HTTP entry point for backend requests and routes requests to the appropriate microservice.



Gateway Routes

Route	Destination

/api/cakes/\*\*	Catalog Service :8081

/api/baskets/\*\*	Order Service :8082

/api/orders/\*\*	Order Service :8082

/api/ratings/\*\*	Rating Service :8083

/api/notifications/\*\*	Notification Service :8084



The gateway therefore separates the frontend from the internal service addresses.



5\. Catalog Service



The Catalog Service runs on port 8081.



Responsibility



The service owns cake product information, including:



Name

Description

Category

Price

Availability

Image reference

Supported Operations



The service provides APIs to:



Create cakes

Retrieve cakes

Retrieve an individual cake

Filter cakes by name

Filter cakes by category

Filter cakes using minimum price

Filter cakes using maximum price

Update cakes

Delete cakes

Persistence

Catalog Service

&#x20;     ↓

catalog\_db

6\. Order Service



The Order Service runs on port 8082.



Responsibility



The service manages:



Shopping baskets

Basket items

Basket quantities

Basket totals

Checkout

Orders

Order items

Order history

Basket Flow

Add Cake

&#x20;  ↓

Basket Item

&#x20;  ↓

Update Quantity

&#x20;  ↓

Recalculate Subtotal

&#x20;  ↓

Recalculate Basket Total

Checkout Flow

Basket

&#x20;  ↓

Validate Basket

&#x20;  ↓

Create Order

&#x20;  ↓

Create Order Items

&#x20;  ↓

Persist Order

&#x20;  ↓

Complete Order

&#x20;  ↓

Publish Order Completion Event

&#x20;  ↓

Clear Basket

Persistence

Order Service

&#x20;     ↓

order\_db

7\. Rating Service



The Rating Service runs on port 8083.



Responsibility



The service manages:



Cake ratings

Review comments

Rating retrieval

Average rating calculation

Duplicate rating prevention



A rating is associated with:



userId

cakeId

rating

comment

createdAt



A user cannot create another rating for the same cake after already submitting one.



Persistence

Rating Service

&#x20;     ↓

rating\_db

8\. Notification Service



The Notification Service runs on port 8084.



It consumes order-completion events asynchronously.



Responsibility



The service:



Receives an order-completion event.

Creates an order-confirmation notification.

Stores the notification.

Marks the notification as SENT.

Persistence

Notification Service

&#x20;       ↓

notification\_db

9\. RabbitMQ Messaging



RabbitMQ is used for asynchronous communication.



The Order Service publishes an order-completion event after successful checkout.



The Notification Service consumes the event.



Order Service

&#x20;    │

&#x20;    │ ORDER\_COMPLETED

&#x20;    ▼

&#x20;RabbitMQ

&#x20;    │

&#x20;    │ order.completed.queue

&#x20;    ▼

Notification Service



This decouples order creation from notification processing.



10\. Database Ownership



Each service owns its own persistence area:



Service	Database

Catalog Service	catalog\_db

Order Service	order\_db

Rating Service	rating\_db

Notification Service	notification\_db



This avoids a single shared application database and preserves service ownership.



11\. Kubernetes Architecture



The application is deployed in the Kubernetes namespace:



cake-delight



The namespace contains the application workloads and supporting infrastructure.



cake-delight

│

├── api-gateway

│

├── catalog-service

│

├── order-service

│

├── rating-service

│

├── notification-service

│

└── rabbitmq



Each application component uses a Kubernetes Deployment and Service where applicable.



12\. Kubernetes Service Discovery



Internal services communicate using Kubernetes service names.



Examples:



catalog-service:8081

order-service:8082

rating-service:8083

notification-service:8084



The Order Service therefore does not need to know the changing Pod IP address of the Catalog Service.



13\. Health and Readiness



Application services expose Spring Boot Actuator health endpoints.



Kubernetes readiness and liveness probes are configured for the deployed services where applicable.



This allows Kubernetes to determine whether a workload is ready to receive traffic and whether a failing container should be restarted.



14\. Containerization



Each backend microservice is packaged as a Docker image.



The application JAR is built using Maven and copied into a lightweight Java runtime image.



The resulting container exposes the port associated with the service.



15\. Communication Patterns

Synchronous Communication



The frontend uses synchronous HTTP requests:



Frontend

&#x20;  ↓

API Gateway

&#x20;  ↓

Backend Service

&#x20;  ↓

Response

Asynchronous Communication



Notifications use asynchronous messaging:



Order Service

&#x20;  ↓

RabbitMQ

&#x20;  ↓

Notification Service

16\. Cloud-Native Characteristics



The architecture demonstrates:



Independent service boundaries

Independent deployment

REST-based APIs

Event-driven communication

Containerized execution

Kubernetes orchestration

Kubernetes service discovery

Service-owned databases

Environment-based configuration

Kubernetes Secrets

Health and readiness probes

17\. End-to-End Customer Journey



The complete customer flow is:



Browse Cakes

&#x20;     ↓

Filter Cakes

&#x20;     ↓

View Cake Details

&#x20;     ↓

Add to Basket

&#x20;     ↓

Modify Basket

&#x20;     ↓

Checkout

&#x20;     ↓

Order Created

&#x20;     ↓

Order Completed

&#x20;     ↓

ORDER\_COMPLETED Event

&#x20;     ↓

RabbitMQ

&#x20;     ↓

Notification Service

&#x20;     ↓

Order Confirmation Notification



Separately:



Checkout

&#x20;  ↓

My Orders

&#x20;  ↓

View Order Details

&#x20;  ↓

Rate / Review Cake

18\. Architecture Summary



Cake Delight combines synchronous REST communication with asynchronous event-driven communication.



The API Gateway provides a single client entry point, while each microservice owns a clearly defined business capability and its corresponding persistence.



Kubernetes provides service deployment, networking, service discovery, health management, and container orchestration.



RabbitMQ provides asynchronous decoupling between order completion and notification processing.

