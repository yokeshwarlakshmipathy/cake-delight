\# Cake Delight



\## Cloud Native Microservices Engineering Capstone



Cake Delight is a cloud-native cake ordering application implemented using a microservices architecture.



The application provides an end-to-end customer journey including:



\- Cake browsing

\- Cake filtering

\- Cake details

\- Basket management

\- Checkout

\- Order history

\- Order details

\- Ratings and reviews

\- Order confirmation notifications



The backend is containerized using Docker and deployed using Kubernetes.



\---



\## Architecture



```text

&#x20;                        ┌──────────────────────┐

&#x20;                        │    React Frontend     │

&#x20;                        │       Vite :5173     │

&#x20;                        └──────────┬───────────┘

&#x20;                                   │

&#x20;                                   ▼

&#x20;                        ┌──────────────────────┐

&#x20;                        │     API Gateway      │

&#x20;                        │        :8091         │

&#x20;                        └──────────┬───────────┘

&#x20;                                   │

&#x20;            ┌──────────────────────┼──────────────────────┐

&#x20;            │                      │                      │

&#x20;            ▼                      ▼                      ▼

&#x20;     Catalog Service        Order Service          Rating Service

&#x20;         :8081                  :8082                   :8083

&#x20;            │                      │                      │

&#x20;            ▼                      ▼                      ▼

&#x20;       catalog\_db             order\_db                rating\_db

&#x20;                                   │

&#x20;                                   │ OrderCompletedEvent

&#x20;                                   ▼

&#x20;                              RabbitMQ

&#x20;                                   │

&#x20;                                   │ order.completed.queue

&#x20;                                   ▼

&#x20;                        Notification Service

&#x20;                               :8084

&#x20;                                   │

&#x20;                                   ▼

&#x20;                          notification\_db



Services

Component	Port	Responsibility

API Gateway	8091	Single API entry point

Catalog Service	8081	Cakes and catalog filtering

Order Service	8082	Basket and orders

Rating Service	8083	Ratings and reviews

Notification Service	8084	Order confirmation notifications

RabbitMQ	5672	Asynchronous messaging

RabbitMQ Management	15672	RabbitMQ management interface

Technology Stack

Java 17

Spring Boot

Spring Data JPA

Spring Cloud Gateway

PostgreSQL

RabbitMQ

React

Vite

Docker

Kubernetes

Maven

H2 for isolated Spring Boot tests

Repository Structure

cake-delight/

│

├── api-gateway/

│

├── frontend/

│

├── services/

│   ├── catalog-service/

│   ├── order-service/

│   ├── rating-service/

│   └── notification-service/

│

├── k8s/

│   ├── api-gateway-deployment.yaml

│   ├── api-gateway-service.yaml

│   ├── catalog-service.yaml

│   ├── notification-service.yaml

│   ├── order-service.yaml

│   ├── rabbitmq.yaml

│   └── rating-service.yaml

│

├── infrastructure/

│

└── docs/

&#x20;   ├── 01-project-overview.md

&#x20;   ├── 02-system-architecture.md

&#x20;   ├── 03-api-documentation.md

&#x20;   ├── 04-database-design.md

&#x20;   ├── 05-event-contract.md

&#x20;   ├── 06-docker-containerization.md

&#x20;   ├── 07-kubernetes-deployment.md

&#x20;   ├── 08-setup-and-execution.md

&#x20;   ├── 09-end-to-end-demo.md

&#x20;   └── 10-assessment-checklist.md

Customer Journey

Browse Cakes

&#x20;    ↓

Filter Cakes

&#x20;    ↓

Cake Details

&#x20;    ↓

Add to Basket

&#x20;    ↓

Update / Remove Items

&#x20;    ↓

Checkout

&#x20;    ↓

Order Confirmation

&#x20;    ↓

My Orders

&#x20;    ↓

View Order Details

&#x20;    ↓

Rate / Review

Event-Driven Notification Flow



After checkout:



Order Service

&#x20;    ↓

OrderCompletedEvent

&#x20;    ↓

RabbitMQ

&#x20;    ↓

order.completed.queue

&#x20;    ↓

Notification Service

&#x20;    ↓

Order Confirmation Notification

&#x20;    ↓

notification\_db



The Notification Service contains:



RabbitMQConfig

OrderCompletedEvent

OrderCompletedListener



The RabbitMQ queue is:



order.completed.queue

API Gateway Routes

/api/cakes/\*\*           → catalog-service:8081

/api/baskets/\*\*         → order-service:8082

/api/orders/\*\*          → order-service:8082

/api/ratings/\*\*         → rating-service:8083

/api/notifications/\*\*  → notification-service:8084

Databases



Each core service owns its own application database:



catalog\_db

order\_db

rating\_db

notification\_db



Cross-service identifiers such as cakeId, orderId, and userId are used through API/event communication rather than shared database foreign keys.



Docker



Each backend service has its own Dockerfile.



The services use a Java 17 runtime container based on:



eclipse-temurin:17-jre



Example:



FROM eclipse-temurin:17-jre



WORKDIR /app



COPY target/<service-jar>.jar app.jar



EXPOSE <service-port>



ENTRYPOINT \["java", "-jar", "app.jar"]

Kubernetes



The application is deployed into:



cake-delight



namespace.



The Kubernetes deployment includes:



api-gateway

catalog-service

order-service

rating-service

notification-service

rabbitmq



Kubernetes provides:



Container orchestration

Service discovery

Health management

Independent deployments

Internal networking

Restart management

Secret-based configuration

Kubernetes Secrets



Database credentials are supplied through:



cake-db-secret



with:



POSTGRES\_USERNAME

POSTGRES\_PASSWORD



Application configuration uses environment variables:



SPRING\_DATASOURCE\_URL

SPRING\_DATASOURCE\_USERNAME

SPRING\_DATASOURCE\_PASSWORD

Testing



Each backend service uses an isolated H2 in-memory database for Spring Boot context tests.



Verified test status:



Catalog Service       ✅ BUILD SUCCESS

Order Service         ✅ BUILD SUCCESS

Rating Service        ✅ BUILD SUCCESS

Notification Service  ✅ BUILD SUCCESS



This keeps test execution independent from the application PostgreSQL databases.



Local API Access



For Kubernetes-based local API testing:



kubectl port-forward -n cake-delight service/api-gateway 8091:8091



Use:



http://127.0.0.1:8091



Example:



Invoke-RestMethod "http://127.0.0.1:8091/api/cakes"



Order history:



Invoke-RestMethod "http://127.0.0.1:8091/api/orders/user/101"



Notifications:



Invoke-RestMethod "http://127.0.0.1:8091/api/notifications/user/101"

Frontend



The frontend is located in:



frontend/



Install dependencies:



cd frontend

npm install



Start the development server:



npm run dev



The frontend provides:



Cakes

Cake Details

Cart

My Orders

Order Details

Ratings / Reviews

Documentation



Detailed documentation is available in the docs folder:



Document	Description

01-project-overview.md	Project scope and objectives

02-system-architecture.md	Architecture and service boundaries

03-api-documentation.md	REST APIs

04-database-design.md	Database and entity model

05-event-contract.md	RabbitMQ event flow

06-docker-containerization.md	Docker implementation

07-kubernetes-deployment.md	Kubernetes deployment

08-setup-and-execution.md	Setup and execution

09-end-to-end-demo.md	Demonstration procedure

10-assessment-checklist.md	Capstone requirement mapping

Capstone Coverage



The project demonstrates:



Microservices architecture

API Gateway

REST communication

Service-owned persistence

Docker containerization

Kubernetes orchestration

Kubernetes service discovery

Kubernetes Secrets

Health and readiness probes

RabbitMQ event-driven communication

End-to-end customer workflow

Ratings and reviews

Order confirmation notifications

End-to-End Flow

React Frontend

&#x20;     ↓

API Gateway

&#x20;     ↓

Catalog / Order / Rating Services

&#x20;     ↓

Checkout

&#x20;     ↓

OrderCompletedEvent

&#x20;     ↓

RabbitMQ

&#x20;     ↓

Notification Service

&#x20;     ↓

Order Confirmation



The user can then access:



My Orders

&#x20;    ↓

View Order

&#x20;    ↓

Rate / Review Cake

Project Status



The Cake Delight capstone application has been implemented and verified across the primary functional and cloud-native requirements.



The backend services successfully pass their automated Spring Boot tests, and the deployed Kubernetes environment supports the demonstrated customer workflow and event-driven notification flow.

