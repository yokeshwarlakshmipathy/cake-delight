\# Cake Delight - Setup and Execution Guide



\## 1. Prerequisites



The Cake Delight application requires:



\- Java 17

\- Maven

\- Docker Desktop

\- Kubernetes

\- kubectl

\- PostgreSQL

\- RabbitMQ

\- Node.js and npm for the React frontend



The backend services are Spring Boot applications.



\---



\# 2. Project Structure



The main project structure is:



```text

cake-delight/

├── api-gateway/

├── frontend/

├── services/

│   ├── catalog-service/

│   ├── order-service/

│   ├── rating-service/

│   └── notification-service/

├── k8s/

├── infrastructure/

└── docs/





3\. Backend Services



The backend contains:



API Gateway

Catalog Service

Order Service

Rating Service

Notification Service



The service ports are:



Component	Port

API Gateway	8091

Catalog Service	8081

Order Service	8082

Rating Service	8083

Notification Service	8084

RabbitMQ	5672

RabbitMQ Management	15672

4\. Database Setup



The application uses separate PostgreSQL databases:



catalog\_db

order\_db

rating\_db

notification\_db



The Kubernetes deployments receive database connection information through environment variables.



Database credentials are supplied through the Kubernetes Secret:



cake-db-secret



The relevant secret keys are:



POSTGRES\_USERNAME

POSTGRES\_PASSWORD



The application source configuration does not contain the previous hardcoded PostgreSQL password.



5\. Building the Backend Services



Each service can be built independently.



Catalog Service

cd services/catalog-service

.\\mvnw.cmd clean package -DskipTests

Order Service

cd services/order-service

.\\mvnw.cmd clean package -DskipTests

Rating Service

cd services/rating-service

.\\mvnw.cmd clean package -DskipTests

Notification Service

cd services/notification-service

.\\mvnw.cmd clean package -DskipTests

6\. Running Tests



The services use an isolated H2 database for Spring Boot context tests.



The test database is not the PostgreSQL application database.



Run:



Catalog

cd services/catalog-service

.\\mvnw.cmd clean test

Order

cd services/order-service

.\\mvnw.cmd clean test

Rating

cd services/rating-service

.\\mvnw.cmd clean test

Notification

cd services/notification-service

.\\mvnw.cmd clean test



The verified test status is:



Catalog Service       → BUILD SUCCESS

Order Service         → BUILD SUCCESS

Rating Service        → BUILD SUCCESS

Notification Service  → BUILD SUCCESS

7\. Docker Images



The services are packaged as Docker images using Java 17 runtime containers.



The Dockerfile pattern is:



FROM eclipse-temurin:17-jre



WORKDIR /app



COPY target/<service-jar>.jar app.jar



EXPOSE <service-port>



ENTRYPOINT \["java", "-jar", "app.jar"]

8\. Building a Docker Image



Example for the Order Service:



cd services/order-service



mvn clean package -DskipTests



docker build -t cakedelight/order-service:1.2 .



The verified current Order Service image is:



cakedelight/order-service:1.2

9\. Kubernetes Namespace



The application is deployed into:



cake-delight



Verify the namespace/resources with:



kubectl get pods -n cake-delight

10\. Kubernetes Manifest Files



The repository contains the following Kubernetes manifests:



k8s/

├── api-gateway-deployment.yaml

├── api-gateway-service.yaml

├── catalog-service.yaml

├── notification-service.yaml

├── order-service.yaml

├── rabbitmq.yaml

└── rating-service.yaml

11\. Kubernetes Deployment Order



Apply the supporting RabbitMQ infrastructure first:



kubectl apply -f .\\k8s\\rabbitmq.yaml



Apply the Catalog Service:



kubectl apply -f .\\k8s\\catalog-service.yaml



Apply the Order Service:



kubectl apply -f .\\k8s\\order-service.yaml



Apply the Rating Service:



kubectl apply -f .\\k8s\\rating-service.yaml



Apply the Notification Service:



kubectl apply -f .\\k8s\\notification-service.yaml



Apply the API Gateway Deployment:



kubectl apply -f .\\k8s\\api-gateway-deployment.yaml



Apply the API Gateway Service:



kubectl apply -f .\\k8s\\api-gateway-service.yaml

12\. Verify Kubernetes Deployments



Check Pods:



kubectl get pods -n cake-delight



Check Deployments:



kubectl get deployments -n cake-delight



Check Services:



kubectl get services -n cake-delight



Check service endpoints:



kubectl get endpoints -n cake-delight



For newer Kubernetes versions, EndpointSlices can also be inspected.



13\. Verify Pod Status



All application Pods should reach:



READY

1/1

STATUS

Running



Example:



api-gateway

catalog-service

order-service

rating-service

notification-service

rabbitmq

14\. Verify Order Service Rollout



After applying the Order Service manifest:



kubectl rollout status deployment/order-service -n cake-delight



Expected result:



deployment "order-service" successfully rolled out



Verify the deployed image:



kubectl get pods -n cake-delight -l app=order-service `

&#x20; -o jsonpath="{.items\[0].spec.containers\[0].image}"



The verified image is:



cakedelight/order-service:1.2

15\. API Gateway Port Forwarding



For local frontend/API testing:



kubectl port-forward -n cake-delight service/api-gateway 8091:8091



Keep this terminal running.



Use:



http://127.0.0.1:8091



for local API access.



Using 127.0.0.1 avoids the local IPv4/IPv6 localhost listener issue encountered during development.



16\. Verify Catalog API



Run:



Invoke-RestMethod "http://127.0.0.1:8091/api/cakes"



The API should return the catalog records.



Example filters:



Invoke-RestMethod "http://127.0.0.1:8091/api/cakes?category=Chocolate"

Invoke-RestMethod "http://127.0.0.1:8091/api/cakes?minPrice=600\&maxPrice=800"

17\. Verify Basket API



Get the basket:



Invoke-RestMethod "http://127.0.0.1:8091/api/baskets/101"



Add an item:



Invoke-RestMethod `

&#x20; -Method POST `

&#x20; -Uri "http://127.0.0.1:8091/api/baskets/101/items" `

&#x20; -ContentType "application/json" `

&#x20; -Body '{"cakeId":1,"quantity":2}'

18\. Verify Checkout



Checkout:



Invoke-RestMethod `

&#x20; -Method POST `

&#x20; -Uri "http://127.0.0.1:8091/api/orders/checkout" `

&#x20; -ContentType "application/json" `

&#x20; -Body '{"userId":101}'



A successful checkout returns the created order.



The basket is cleared after successful checkout.



19\. Verify Order History

Invoke-RestMethod `

&#x20; "http://127.0.0.1:8091/api/orders/user/101" |

&#x20; ConvertTo-Json -Depth 10



This returns the order history for user 101.



20\. Verify Rating



Create a rating using:



Invoke-RestMethod `

&#x20; -Method POST `

&#x20; -Uri "http://127.0.0.1:8091/api/ratings" `

&#x20; -ContentType "application/json" `

&#x20; -Body '{"userId":101,"cakeId":1,"rating":5,"comment":"Fresh and delicious!"}'



Retrieve ratings:



Invoke-RestMethod `

&#x20; "http://127.0.0.1:8091/api/ratings/cake/1"



Retrieve average rating:



Invoke-RestMethod `

&#x20; "http://127.0.0.1:8091/api/ratings/cake/1/average"



A second rating attempt by the same user for the same cake is rejected according to the duplicate-rating rule.



21\. Verify Notifications



Retrieve notifications for a user:



Invoke-RestMethod `

&#x20; "http://127.0.0.1:8091/api/notifications/user/101" |

&#x20; ConvertTo-Json -Depth 10



Retrieve notifications for an order:



Invoke-RestMethod `

&#x20; "http://127.0.0.1:8091/api/notifications/order/16" |

&#x20; ConvertTo-Json -Depth 10



Successful order-confirmation notifications contain:



type:

ORDER\_CONFIRMATION



status:

SENT

22\. Verify RabbitMQ Event Flow



The event-driven notification flow is:



Checkout

&#x20;  ↓

Order Service

&#x20;  ↓

ORDER\_COMPLETED

&#x20;  ↓

RabbitMQ

&#x20;  ↓

order.completed.queue

&#x20;  ↓

Notification Service

&#x20;  ↓

Notification Database



Notification Service logs can be viewed using:



kubectl logs <notification-service-pod> -n cake-delight --tail=150



The service logs demonstrate RabbitMQ connectivity and notification persistence.



23\. Verify Internal Kubernetes Communication



The Order Service can be tested directly from inside the cluster:



kubectl run order-test `

&#x20; --rm -it `

&#x20; --restart=Never `

&#x20; -n cake-delight `

&#x20; --image=curlimages/curl `

&#x20; -- curl -s -i http://order-service:8082/api/orders/user/101



A successful response returns:



HTTP/1.1 200



The API Gateway can also be tested internally:



kubectl run gateway-test `

&#x20; --rm -it `

&#x20; --restart=Never `

&#x20; -n cake-delight `

&#x20; --image=curlimages/curl `

&#x20; -- curl -s -i http://api-gateway:8091/api/orders/user/101



A successful response returns:



HTTP/1.1 200

24\. Frontend Setup



The frontend is located in:



frontend/



Install dependencies:



cd frontend

npm install



Start the development server:



npm run dev



The Vite development server runs on the configured frontend port, typically:



http://127.0.0.1:5173



The frontend uses the API Gateway as its backend API path.



25\. Frontend Customer Flow



After starting the frontend and API Gateway port forwarding:



http://127.0.0.1:5173/



The customer can:



Browse Cakes

&#x20;   ↓

Filter Cakes

&#x20;   ↓

Open Cake Details

&#x20;   ↓

Add to Cart

&#x20;   ↓

Update / Remove Items

&#x20;   ↓

Checkout

&#x20;   ↓

Order Confirmation

&#x20;   ↓

My Orders

&#x20;   ↓

View Order

&#x20;   ↓

Rate / Review Cake

26\. Troubleshooting

Pod Not Running



Check:



kubectl get pods -n cake-delight



Check service logs:



kubectl logs <pod-name> -n cake-delight

Deployment Not Ready



Check:



kubectl describe pod <pod-name> -n cake-delight



Check rollout:



kubectl rollout status deployment/<deployment-name> -n cake-delight

API Gateway Port Conflict



Check port usage:



Get-NetTCPConnection -LocalPort 8091 -State Listen



Use the API Gateway through:



http://127.0.0.1:8091



after starting:



kubectl port-forward -n cake-delight service/api-gateway 8091:8091

Database Configuration Problems



Verify that Kubernetes Secrets exist:



kubectl get secrets -n cake-delight



Inspect the Deployment environment configuration:



kubectl describe deployment <deployment-name> -n cake-delight



Do not store PostgreSQL credentials directly in application source configuration.



RabbitMQ Problems



Check:



kubectl get pods -n cake-delight -l app=rabbitmq



Check logs:



kubectl logs <rabbitmq-pod> -n cake-delight



Check the RabbitMQ Service:



kubectl get service rabbitmq -n cake-delight

27\. Clean Build and Rebuild



When a service source change is made:



Source Code

&#x20;   ↓

Maven Build

&#x20;   ↓

Docker Image

&#x20;   ↓

Update Kubernetes Manifest

&#x20;   ↓

kubectl apply

&#x20;   ↓

Rollout Verification



Example:



cd services/order-service

mvn clean package -DskipTests

docker build -t cakedelight/order-service:1.2 .



Then:



cd ../..

kubectl apply -f .\\k8s\\order-service.yaml

kubectl rollout status deployment/order-service -n cake-delight

28\. Final Startup Checklist



Before demonstrating the project:



\[ ] PostgreSQL databases are available

\[ ] RabbitMQ is running

\[ ] Kubernetes cluster is running

\[ ] cake-delight namespace is available

\[ ] Kubernetes Secrets are configured

\[ ] All backend Pods are Running

\[ ] API Gateway Pod is Running

\[ ] Port forwarding is active

\[ ] Frontend is running



Verify:



kubectl get pods -n cake-delight



Then:



kubectl get services -n cake-delight

29\. Final Verification



A complete application verification should demonstrate:



Catalog

&#x20;   ↓

Basket

&#x20;   ↓

Checkout

&#x20;   ↓

Order

&#x20;   ↓

RabbitMQ Event

&#x20;   ↓

Notification

&#x20;   ↓

Order History

&#x20;   ↓

Order Details

&#x20;   ↓

Rating



This confirms the major functional and cloud-native components of Cake Delight are operational.

