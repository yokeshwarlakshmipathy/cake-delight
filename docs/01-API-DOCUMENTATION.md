\# Cake Delight - API Documentation



\## 1. Overview



Cake Delight follows a microservices architecture with an API Gateway acting as the single entry point for frontend requests.



\### API Gateway



\- Host: `http://127.0.0.1:8091`

\- Port: `8091`

\- Base path: `/api`



The frontend communicates with backend services through the API Gateway.



\---



\# 2. Cake Catalog Service



\## Service



\- Service Name: `catalog-service`

\- Internal Port: `8081`

\- Database: Catalog Database



The Catalog Service manages cake product information including:



\- Name

\- Description

\- Category

\- Price

\- Availability

\- Image URL



\---



\## 2.1 Get Cakes



\### Endpoint



```http

GET /api/cakes

