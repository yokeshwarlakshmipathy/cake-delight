\# Cake Delight - Capstone Assessment Checklist



\## 1. Purpose



This document maps the Cake Delight implementation to the functional scope, architecture requirements, technology expectations, and deliverables defined in the capstone assessment.



\---



\# 2. Functional Requirements



| Assessment Requirement | Implementation | Status |

|---|---|---|

| Browse available cakes | Catalog Service + React Cakes page | ✅ |

| Filter by product name | Catalog API `name` parameter | ✅ |

| Filter by category | Catalog API `category` parameter | ✅ |

| Filter by price range | `minPrice` / `maxPrice` parameters | ✅ |

| Add selected cakes to basket | Order Service Basket API | ✅ |

| View basket contents | `GET /api/baskets/{userId}` | ✅ |

| Update basket contents | `PUT /api/baskets/{userId}/items/{itemId}` | ✅ |

| Remove basket items | `DELETE /api/baskets/{userId}/items/{itemId}` | ✅ |

| Complete checkout | `POST /api/orders/checkout` | ✅ |

| Create order | Order Service | ✅ |

| Maintain order status | Order entity + status field | ✅ |

| Submit cake ratings | Rating Service | ✅ |

| Store cake reviews | Rating Service | ✅ |

| Retrieve ratings | Rating Service | ✅ |

| Calculate average rating | Rating Service | ✅ |

| Prevent duplicate ratings | `existsByUserIdAndCakeId()` | ✅ |

| Order history | `GET /api/orders/user/{userId}` | ✅ |

| Order details | `GET /api/orders/{orderId}` | ✅ |

| Order confirmation notification | Notification Service | ✅ |

| Event-driven notification | RabbitMQ + `ORDER\_COMPLETED` | ✅ |



\---



\# 3. Microservices Design Requirements



\## Cake Catalog Microservice



\### Required



\- Maintain cake information.

\- Support name.

\- Support description.

\- Support category.

\- Support price.

\- Support availability.

\- Support image reference.

\- List cakes.

\- Retrieve selected cake.

\- Filter by name.

\- Filter by category.

\- Filter by price range.



\### Implementation



```text

Catalog Service

Port: 8081

Database: catalog\_db

API Prefix: /api/cakes



Primary controller:



CakeController



Filtering is implemented through dynamic JPA Specifications.



Status:



✅ Complete

Order Microservice

Required

Manage baskets.

Add basket items.

Update basket items.

Remove basket items.

Calculate basket totals.

Create orders.

Maintain order status.

Publish order completion event.

Implementation

Order Service

Port: 8082

Database: order\_db

Basket API: /api/baskets

Order API: /api/orders



Business entities include:



Basket

BasketItem

Order

OrderItem



Status:



✅ Complete

Rating Microservice

Required

Submit ratings.

Store ratings.

Retrieve ratings.

Calculate average ratings.

Implementation

Rating Service

Port: 8083

Database: rating\_db

API Prefix: /api/ratings



Rating validation:



1 <= rating <= 5



Duplicate user/cake ratings are prevented.



Status:



✅ Complete

Notification Microservice

Required

Listen for order completion events.

Generate order confirmation notification.

Maintain notification status where applicable.

Implementation

Notification Service

Port: 8084

Database: notification\_db

API Prefix: /api/notifications

RabbitMQ Consumer: order.completed.queue



The Notification Service consumes the order completion event and persists:



type   = ORDER\_CONFIRMATION

status = SENT



Status:



✅ Complete

4\. Architecture Requirements

API Gateway



Requirement:



API Gateway acts as the single entry point for client requests.



Implementation:



API Gateway

Port: 8091



Routes:



/api/cakes/\*\*           → catalog-service:8081

/api/baskets/\*\*         → order-service:8082

/api/orders/\*\*          → order-service:8082

/api/ratings/\*\*         → rating-service:8083

/api/notifications/\*\*  → notification-service:8084



Status:



✅ Complete

Independent Service Deployment



Each major service has its own:



Source code

Maven project

Docker image

Kubernetes Deployment

Kubernetes Service



Status:



✅ Complete

Service-Owned Persistence



The databases are separated by service:



Catalog Service       → catalog\_db

Order Service         → order\_db

Rating Service        → rating\_db

Notification Service  → notification\_db



Status:



✅ Complete

REST Communication



Synchronous operations use REST APIs.



Examples:



Frontend

&#x20;  ↓

API Gateway

&#x20;  ↓

Catalog Service



Frontend

&#x20;  ↓

API Gateway

&#x20;  ↓

Order Service



Frontend

&#x20;  ↓

API Gateway

&#x20;  ↓

Rating Service



Status:



✅ Complete

Event-Driven Communication



The application uses RabbitMQ for asynchronous order completion processing.



Order Service

&#x20;     ↓

ORDER\_COMPLETED

&#x20;     ↓

RabbitMQ

&#x20;     ↓

order.completed.queue

&#x20;     ↓

Notification Service



Status:



✅ Complete

5\. Containerization Requirements

Docker



Backend services are packaged as Docker images.



The services use Java 17 runtime containers.



Representative Dockerfile:



FROM eclipse-temurin:17-jre



WORKDIR /app



COPY target/<service-jar>.jar app.jar



EXPOSE <service-port>



ENTRYPOINT \["java", "-jar", "app.jar"]



Status:



✅ Complete

6\. Kubernetes Requirements

Kubernetes Deployment



The application is deployed in:



cake-delight



Namespace.



Workloads include:



api-gateway

catalog-service

order-service

rating-service

notification-service

rabbitmq



Status:



✅ Complete

Kubernetes Service Discovery



Internal service names are used:



catalog-service:8081

order-service:8082

rating-service:8083

notification-service:8084

rabbitmq:5672



Status:



✅ Complete

Health Checks



Spring Boot Actuator health endpoints are used with Kubernetes probes where configured.



Examples:



/actuator/health/liveness

/actuator/health/readiness



Status:



✅ Implemented

Kubernetes Secrets



Database credentials are supplied through:



cake-db-secret



Keys:



POSTGRES\_USERNAME

POSTGRES\_PASSWORD



Application configuration uses environment variables instead of the previously hardcoded database credentials.



Status:



✅ Complete

7\. Scalability and Maintainability



The architecture supports independent scaling because each core business capability is deployed separately.



For example:



catalog-service

order-service

rating-service

notification-service



can be managed independently through Kubernetes Deployments.



The service boundaries also allow individual services to be updated without rebuilding the entire application.



Status:



✅ Demonstrated through independent service deployments

8\. Resilience and Operational Practices



Implemented operational practices include:



Kubernetes liveness probes

Kubernetes readiness probes

Spring Boot Actuator

Container restart management through Kubernetes

Service discovery through Kubernetes Services

Application logging

RabbitMQ asynchronous decoupling



Status:



✅ Basic cloud-native operational practices implemented



Advanced resilience mechanisms such as circuit breakers and distributed retry policies are not part of the current implementation.



9\. Test Validation



All four backend Spring Boot services have passing Maven tests.



Service	Test Result

Catalog Service	✅ BUILD SUCCESS

Order Service	✅ BUILD SUCCESS

Rating Service	✅ BUILD SUCCESS

Notification Service	✅ BUILD SUCCESS



The test configurations use isolated H2 in-memory databases.



Application PostgreSQL databases are not required for these context tests.



10\. Security / Configuration Validation



The service source configuration was checked for the previously hardcoded values:



password: 123

username: postgres



The verification returned no matching source configuration entries.



Kubernetes deployments use cake-db-secret for database credentials.



Status:



✅ Verified

11\. API Documentation



API documentation is provided in:



docs/03-api-documentation.md



It covers:



Catalog APIs

Basket APIs

Order APIs

Rating APIs

Notification APIs

Health endpoints

Gateway routes



Status:



✅ Complete

12\. Database Documentation



Database documentation is provided in:



docs/04-database-design.md



It covers:



Catalog database

Order database

Rating database

Notification database

Entity relationships

Service ownership

Test database configuration



Status:



✅ Complete

13\. Event Contract Documentation



Event documentation is provided in:



docs/05-event-contract.md



It covers:



ORDER\_COMPLETED

Event producer

RabbitMQ

order.completed.queue

Event consumer

Notification processing



Status:



✅ Complete

14\. Docker Documentation



Containerization documentation is provided in:



docs/06-docker-containerization.md



Status:



✅ Complete

15\. Kubernetes Documentation



Kubernetes documentation is provided in:



docs/07-kubernetes-deployment.md



It covers:



Namespace

Deployments

Services

Service discovery

Secrets

Health probes

Rollouts

Port forwarding

Verification commands



Status:



✅ Complete

16\. Setup Documentation



Setup and execution instructions are provided in:



docs/08-setup-and-execution.md



Status:



✅ Complete

17\. Demonstration Documentation



The end-to-end demonstration procedure is provided in:



docs/09-end-to-end-demo.md



The demonstration covers:



Browse

&#x20; ↓

Filter

&#x20; ↓

Cake Details

&#x20; ↓

Basket

&#x20; ↓

Checkout

&#x20; ↓

Order Confirmation

&#x20; ↓

My Orders

&#x20; ↓

View Order

&#x20; ↓

Rating

&#x20; ↓

Notification

&#x20; ↓

Kubernetes Verification



Status:



✅ Complete

18\. Assessment Deliverables



The capstone requires:



Source Code



Implemented:



✅ Catalog Service

✅ Order Service

✅ Rating Service

✅ Notification Service

✅ API Gateway

✅ React Frontend

API Documentation

✅ docs/03-api-documentation.md

Dockerfiles

✅ Service Dockerfiles

Kubernetes Configuration

✅ k8s/

Database/Data Model

✅ docs/04-database-design.md

Message/Event Contract

✅ docs/05-event-contract.md

Setup and Execution

✅ docs/08-setup-and-execution.md

End-to-End Demonstration

✅ docs/09-end-to-end-demo.md

19\. Final Functional Verification



The major functional journey has been verified:



✅ Browse cakes

✅ Filter cakes

✅ View cake details

✅ Add to basket

✅ Update basket

✅ Remove basket items

✅ Checkout

✅ Create order

✅ View order history

✅ View order details

✅ Submit rating

✅ Prevent duplicate rating

✅ View ratings

✅ Calculate average rating

✅ Generate order confirmation notification

✅ RabbitMQ event communication

20\. Final Technical Verification



The following technical components have been verified:



✅ Spring Boot services

✅ Java 17 target runtime

✅ Maven builds

✅ H2 test configuration

✅ PostgreSQL application databases

✅ RabbitMQ

✅ REST APIs

✅ API Gateway

✅ Docker

✅ Kubernetes

✅ Kubernetes Services

✅ Kubernetes Secrets

✅ Liveness/readiness probes

✅ Service discovery

21\. Final Capstone Mapping

Capstone Area	Cake Delight Implementation	Status

Microservices architecture	Catalog, Order, Rating, Notification	✅

API Gateway	Spring Cloud Gateway	✅

REST communication	HTTP APIs	✅

Database persistence	PostgreSQL per service	✅

Event-driven communication	RabbitMQ	✅

Containerization	Docker	✅

Orchestration	Kubernetes	✅

Service discovery	Kubernetes Services	✅

Health management	Actuator + probes	✅

Customer workflow	React frontend	✅

Ratings	Rating Service	✅

Notifications	Notification Service	✅

Documentation	docs/	✅

22\. Final Project Status



The Cake Delight implementation satisfies the primary functional and cloud-native requirements of the capstone assessment.



The project provides an end-to-end customer journey while demonstrating:



Microservice boundaries

REST APIs

Event-driven messaging

Independent service deployment

Docker containerization

Kubernetes orchestration

Service-owned persistence

Basic operational health management

Secure environment-based database configuration

