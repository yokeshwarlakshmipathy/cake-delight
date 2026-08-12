\# Cake Delight - Kubernetes Deployment



\## 1. Overview



Cake Delight is deployed using Kubernetes to provide container orchestration, service discovery, health management, and independently managed workloads.



All application components are deployed in the Kubernetes namespace:



```text

cake-delight



The deployment includes the API Gateway, Catalog Service, Order Service, Rating Service, Notification Service, and RabbitMQ.



2\. Kubernetes Namespace



The application workloads are deployed into:



cake-delight



The namespace provides logical isolation for the Cake Delight application resources.



3\. Kubernetes Components



The running application includes the following major workloads:



cake-delight

│

├── api-gateway

├── catalog-service

├── order-service

├── rating-service

├── notification-service

└── rabbitmq

4\. Kubernetes Services



The application uses Kubernetes Services for internal service discovery.



Service	Application Port

api-gateway	8091

catalog-service	8081

order-service	8082

rating-service	8083

notification-service	8084

rabbitmq	5672

RabbitMQ Management	15672



Example internal service addresses:



catalog-service:8081

order-service:8082

rating-service:8083

notification-service:8084

rabbitmq:5672



The services use Kubernetes DNS/service names rather than Pod IP addresses.



5\. API Gateway Deployment



The API Gateway runs on port:



8091



It provides the client-facing entry point.



The Gateway routes requests to:



/api/cakes/\*\*           → catalog-service:8081

/api/baskets/\*\*         → order-service:8082

/api/orders/\*\*          → order-service:8082

/api/ratings/\*\*         → rating-service:8083

/api/notifications/\*\*  → notification-service:8084

6\. Catalog Service Deployment



The Catalog Service runs on:



8081



Its Kubernetes Service provides the internal endpoint:



catalog-service:8081



The service is responsible for cake product data and filtering.



7\. Order Service Deployment



The Order Service runs on:



8082



Its Kubernetes Service provides:



order-service:8082



The deployment uses a versioned Docker image.



The verified current image is:



cakedelight/order-service:1.2



The deployment was successfully rolled out using Kubernetes.



8\. Rating Service Deployment



The Rating Service runs on:



8083



Its internal Kubernetes Service is:



rating-service:8083



The service manages ratings, comments, average ratings, and duplicate-rating prevention.



9\. Notification Service Deployment



The Notification Service runs on:



8084



Its internal Kubernetes Service is:



notification-service:8084



The service consumes RabbitMQ order-completion events and persists order confirmation notifications.



10\. RabbitMQ Deployment



RabbitMQ provides asynchronous messaging for the application.



The RabbitMQ service exposes:



5672



for AMQP communication.



The management interface is exposed on:



15672



The primary event-driven flow is:



Order Service

&#x20;     ↓

RabbitMQ

&#x20;     ↓

order.completed.queue

&#x20;     ↓

Notification Service

11\. Kubernetes Secrets



Database credentials are provided using Kubernetes Secrets rather than storing the credentials directly in Deployment manifests.



The application deployments reference:



cake-db-secret



The relevant keys are:



POSTGRES\_USERNAME

POSTGRES\_PASSWORD



Example:



env:

&#x20; - name: SPRING\_DATASOURCE\_USERNAME

&#x20;   valueFrom:

&#x20;     secretKeyRef:

&#x20;       name: cake-db-secret

&#x20;       key: POSTGRES\_USERNAME



&#x20; - name: SPRING\_DATASOURCE\_PASSWORD

&#x20;   valueFrom:

&#x20;     secretKeyRef:

&#x20;       name: cake-db-secret

&#x20;       key: POSTGRES\_PASSWORD



This keeps deployment credentials separate from the service source code.



12\. Health Probes



The Kubernetes deployments use Spring Boot Actuator health endpoints for liveness and readiness where configured.



Example Order Service liveness endpoint:



/actuator/health/liveness



Example readiness endpoint:



/actuator/health/readiness



The probes allow Kubernetes to determine whether the application is alive and ready to receive traffic.



Example configuration:



livenessProbe:

&#x20; httpGet:

&#x20;   path: /actuator/health/liveness

&#x20;   port: 8082



readinessProbe:

&#x20; httpGet:

&#x20;   path: /actuator/health/readiness

&#x20;   port: 8082

13\. Service Discovery



Kubernetes Services provide stable network names even when Pods are recreated.



For example:



Order Service:

order-service:8082



The Catalog Service can therefore be accessed by:



catalog-service:8081



rather than using a changing Pod IP.



This provides service discovery within the Kubernetes cluster.



14\. Deployment Commands

View all Pods

kubectl get pods -n cake-delight

View all Services

kubectl get services -n cake-delight

View Deployments

kubectl get deployments -n cake-delight

View Endpoints

kubectl get endpoints -n cake-delight



Kubernetes versions where the legacy Endpoints API is deprecated can use EndpointSlices instead.



15\. Rollout Verification



After applying a Deployment manifest:



kubectl apply -f .\\k8s\\order-service.yaml



verify the rollout:



kubectl rollout status deployment/order-service -n cake-delight



A successful rollout is reported as:



deployment "order-service" successfully rolled out

16\. Verifying a Running Image



The image used by a running Pod can be checked using:



kubectl get pods -n cake-delight -l app=order-service `

&#x20; -o jsonpath="{.items\[0].spec.containers\[0].image}"



The verified Order Service deployment uses:



cakedelight/order-service:1.2

17\. Viewing Service Logs



Logs can be viewed using:



kubectl logs <pod-name> -n cake-delight



Examples:



kubectl logs <order-service-pod> -n cake-delight

kubectl logs <notification-service-pod> -n cake-delight



The Notification Service logs demonstrate its RabbitMQ connection and notification persistence activity.



18\. API Gateway Port Forwarding



For local testing, the API Gateway Service can be exposed through Kubernetes port forwarding:



kubectl port-forward -n cake-delight service/api-gateway 8091:8091



The local gateway can then be accessed through:



http://127.0.0.1:8091



Example API test:



Invoke-RestMethod "http://127.0.0.1:8091/api/cakes"



Example order-history test:



Invoke-RestMethod "http://127.0.0.1:8091/api/orders/user/101"

19\. Verified Kubernetes Runtime



The application runtime was verified with the following components running:



api-gateway

catalog-service

order-service

rating-service

notification-service

rabbitmq



The Kubernetes Endpoints verified active service targets for the deployed workloads.



The Order Service and API Gateway were also directly tested from inside the cluster.



For example:



order-service:8082/api/orders/user/101

→ HTTP 200



and:



api-gateway:8091/api/orders/user/101

→ HTTP 200



This verifies Kubernetes service discovery and internal request routing.



20\. End-to-End Kubernetes Communication



The runtime request flow is:



React Frontend

&#x20;     ↓

API Gateway :8091

&#x20;     ↓

Kubernetes Service

&#x20;     ↓

Target Microservice Pod

&#x20;     ↓

Service Database



For asynchronous notifications:



Order Service

&#x20;     ↓

RabbitMQ

&#x20;     ↓

order.completed.queue

&#x20;     ↓

Notification Service

&#x20;     ↓

Notification Database

21\. Kubernetes Resource Ownership



Each application service has an independently managed Kubernetes workload.



This supports:



Independent deployment

Independent image updates

Service discovery

Health monitoring

Container restart management

Horizontal scaling capability through Kubernetes deployments

22\. Deployment Summary



The Kubernetes deployment provides the following cloud-native capabilities:



✓ Container orchestration

✓ Service discovery

✓ Independent service deployment

✓ Health/readiness checking

✓ Secret-based credentials

✓ Internal networking

✓ Versioned container images

✓ Event-driven messaging infrastructure



The cake-delight namespace provides the execution environment for the application and its supporting RabbitMQ component.

