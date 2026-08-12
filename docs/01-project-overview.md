\# Cake Delight - Project Overview



\## 1. Project Title



\*\*Cake Delight - Cloud Native Microservices Application\*\*



\## 2. Introduction



Cake Delight is a cloud-native microservices-based application designed to provide an end-to-end online cake ordering experience.



The application allows customers to browse cakes, filter products, view cake details, add cakes to a basket, modify basket contents, complete checkout, view order history, view order details, submit ratings and reviews, and receive order confirmation notifications.



The solution demonstrates independent microservice deployment, REST-based communication, event-driven messaging, containerization, database-backed persistence, and Kubernetes orchestration.



\## 3. Problem Statement



The objective is to design and develop a cloud-native application that separates major business capabilities into independently deployable services while still providing a complete customer journey.



The application must support:



\- Cake catalog browsing

\- Product filtering

\- Shopping basket management

\- Checkout and order creation

\- Cake ratings and reviews

\- Order confirmation notifications

\- Containerized services

\- Kubernetes-based deployment

\- Event-driven communication



\## 4. Project Objectives



The project demonstrates the following engineering capabilities:



1\. Designing business capabilities using a microservices architecture.

2\. Separating catalog, order, rating, and notification responsibilities.

3\. Providing REST APIs through an API Gateway.

4\. Using RabbitMQ for asynchronous order-completion events.

5\. Persisting service-specific data in separate databases.

6\. Containerizing services using Docker.

7\. Deploying and managing services using Kubernetes.

8\. Applying health checks and service discovery.

9\. Providing a complete customer-facing frontend workflow.



\## 5. Functional Scope



\### 5.1 Cake Catalog



Customers can:



\- Browse available cakes.

\- View cake details.

\- Filter cakes by name.

\- Filter cakes by category.

\- Filter cakes using minimum and maximum price.

\- View product availability and pricing.



\### 5.2 Shopping Basket



Customers can:



\- Add cakes to the basket.

\- Increase or decrease quantities.

\- Remove items.

\- View basket totals.



\### 5.3 Checkout



Customers can:



\- Review the basket.

\- Complete checkout.

\- Create an order.

\- Receive an order confirmation result.

\- View the generated order in order history.



\### 5.4 Ratings and Reviews



Customers can:



\- View ratings for a cake.

\- View the average rating.

\- Submit a rating from 1 to 5.

\- Submit an optional review comment.

\- Receive a clear duplicate-rating response when the same user attempts to rate the same cake again.



\### 5.5 Order History



Customers can:



\- View previous orders.

\- View order status.

\- View order totals.

\- View individual cake items.

\- Open a detailed order view.



\### 5.6 Notifications



After successful checkout:



1\. The Order Service publishes an order-completion event.

2\. RabbitMQ transports the event.

3\. The Notification Service consumes the event.

4\. An order-confirmation notification is stored.

5\. The notification is marked as `SENT`.



\## 6. Technology Stack



| Layer | Technology |

|---|---|

| Frontend | React |

| Frontend Build Tool | Vite |

| Backend Framework | Spring Boot |

| Programming Language | Java 17 |

| API Gateway | Spring Cloud Gateway |

| Database | PostgreSQL |

| Test Database | H2 |

| ORM | Spring Data JPA / Hibernate |

| Messaging | RabbitMQ |

| Containerization | Docker |

| Orchestration | Kubernetes |

| API Communication | REST |

| Build Tool | Maven |



\## 7. Microservices



\### API Gateway



\*\*Port:\*\* 8091



Acts as the single entry point for client requests and routes requests to the appropriate backend service.



\### Catalog Service



\*\*Port:\*\* 8081



Responsible for:



\- Cake information

\- Cake search

\- Category filtering

\- Price filtering

\- Cake availability



\### Order Service



\*\*Port:\*\* 8082



Responsible for:



\- Basket management

\- Basket item quantities

\- Basket totals

\- Checkout

\- Order creation

\- Order history

\- Order retrieval

\- Publishing order-completion events



\### Rating Service



\*\*Port:\*\* 8083



Responsible for:



\- Creating ratings

\- Retrieving cake ratings

\- Calculating average ratings

\- Preventing duplicate ratings by the same user for the same cake



\### Notification Service



\*\*Port:\*\* 8084



Responsible for:



\- Consuming order-completion events

\- Creating order-confirmation notifications

\- Storing notification status



\### RabbitMQ



RabbitMQ provides asynchronous communication between the Order Service and Notification Service.



\## 8. Database Ownership



Each backend service owns its business data:



```text

Catalog Service

&#x20;   → catalog\_db



Order Service

&#x20;   → order\_db



Rating Service

&#x20;   → rating\_db



Notification Service

&#x20;   → notification\_db



This follows the microservice principle of service-owned persistence.



9\. API Gateway Routes



The API Gateway exposes the following service routes:



/api/cakes/\*\*          → Catalog Service :8081

/api/baskets/\*\*        → Order Service :8082

/api/orders/\*\*         → Order Service :8082

/api/ratings/\*\*        → Rating Service :8083

/api/notifications/\*\* → Notification Service :8084

10\. Cloud-Native Characteristics



The application demonstrates:



Independently deployable services

Docker-based containerization

Kubernetes Deployments

Kubernetes Services

Kubernetes service discovery

Health and readiness probes

API Gateway routing

Asynchronous messaging

Service-specific persistence

Environment-based configuration

Kubernetes Secrets for database credentials

Isolated test configuration using H2

11\. Security and Configuration Practice



Production-style database credentials are not stored directly in service source configuration.



The application uses environment variables such as:



SPRING\_DATASOURCE\_URL

SPRING\_DATASOURCE\_USERNAME

SPRING\_DATASOURCE\_PASSWORD



Kubernetes deployments obtain database credentials through Kubernetes Secrets.



Automated service tests use isolated in-memory H2 databases instead of the application PostgreSQL databases.



12\. Validation Status



The four backend services have been validated using their Maven test suites:



Catalog Service       - BUILD SUCCESS

Order Service         - BUILD SUCCESS

Rating Service        - BUILD SUCCESS

Notification Service  - BUILD SUCCESS



The end-to-end application flow has also been verified through the running Kubernetes deployment and frontend.



13\. Project Status



The Cake Delight application currently demonstrates the required customer journey:



Browse Cakes

&#x20;   ↓

Filter Cakes

&#x20;   ↓

View Cake Details

&#x20;   ↓

Add to Basket

&#x20;   ↓

Update / Remove Basket Items

&#x20;   ↓

Checkout

&#x20;   ↓

Order Confirmation

&#x20;   ↓

My Orders

&#x20;   ↓

View Order Details

&#x20;   ↓

Rate / Review Cake

&#x20;   ↓

Order Completion Notification

14\. Conclusion



Cake Delight demonstrates a practical cloud-native microservices architecture with REST APIs, event-driven communication, Docker containerization, Kubernetes orchestration, database-backed persistence, and a React customer interface.



The project is structured around independently deployable business capabilities while maintaining an end-to-end customer ordering workflow.

