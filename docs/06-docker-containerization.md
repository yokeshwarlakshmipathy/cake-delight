# Cake Delight - Docker Containerization



## 1. Overview



Cake Delight uses Docker to package the backend microservices as portable and independently deployable containers.



Each Spring Boot service is first packaged as an executable JAR using Maven and then copied into a Java 17 runtime container.



The containerized services are later deployed through Kubernetes.



\---



## 2. Containerization Architecture



The backend services are independently containerized:



```text

Catalog Service

&#x20;   ↓

Docker Image

&#x20;   ↓

Kubernetes



Order Service

&#x20;   ↓

Docker Image

&#x20;   ↓

Kubernetes



Rating Service

&#x20;   ↓

Docker Image

&#x20;   ↓

Kubernetes



Notification Service

&#x20;   ↓

Docker Image

&#x20;   ↓

Kubernetes



API Gateway

&#x20;   ↓

Docker Image

&#x20;   ↓

Kubernetes



RabbitMQ

&#x20;   ↓

Container / Kubernetes workload



3. Java Runtime



The backend services use:



Java 17



The service Dockerfiles use the Eclipse Temurin Java 17 JRE base image:



FROM eclipse-temurin:17-jre



The use of a JRE runtime image keeps the application container focused on running the already-built Spring Boot application.



4. Service Dockerfile Pattern



The Order Service Dockerfile is representative of the implemented containerization pattern:



FROM eclipse-temurin:17-jre



WORKDIR /app



COPY target/order-service-0.0.1-SNAPSHOT.jar app.jar



EXPOSE 8082



ENTRYPOINT \["java", "-jar", "app.jar"]



The same overall pattern is used for the backend Java services:



Build JAR

&#x20;  ↓

Create runtime image

&#x20;  ↓

Copy JAR into /app

&#x20;  ↓

Expose service port

&#x20;  ↓

Run java -jar app.jar

5. Maven Build



Each service is built independently using Maven.



Example:



cd services/order-service

mvn clean package -DskipTests



The successful build generates:



target/order-service-0.0.1-SNAPSHOT.jar



The Spring Boot Maven Plugin then repackages the JAR as an executable Spring Boot archive.



6. Order Service Image Build



The Order Service image was built using:



docker build -t cakedelight/order-service:1.2 .



The resulting image is:



cakedelight/order-service:1.2



This image was subsequently deployed to Kubernetes.



The Kubernetes deployment was verified to use:



cakedelight/order-service:1.2

7. Image Versioning



Image tags are used to distinguish application versions.



Example:



cakedelight/order-service:1.0

cakedelight/order-service:1.1

cakedelight/order-service:1.2



The Order Service was updated from an earlier image to:



cakedelight/order-service:1.2



after adding the order-history endpoint.



This demonstrates an independently deployable service update.



8. Container-to-Service Communication



The containers do not rely on hardcoded Pod IP addresses.



Within Kubernetes, services communicate through Kubernetes Service DNS names.



Examples include:



catalog-service:8081

order-service:8082

rating-service:8083

notification-service:8084

rabbitmq:5672



This allows Pods to be recreated without requiring application configuration to use a specific Pod IP.



9. Environment-Based Configuration



The application containers receive environment-specific configuration through environment variables.



Database configuration uses:



SPRING_DATASOURCE_URL

SPRING_DATASOURCE_USERNAME

SPRING_DATASOURCE_PASSWORD



RabbitMQ configuration uses:



SPRING_RABBITMQ_HOST

SPRING_RABBITMQ_PORT

SPRING_RABBITMQ_USERNAME

SPRING_RABBITMQ_PASSWORD



This separates deployment configuration from application source code.



10. Kubernetes Secrets and Containers



Database credentials are supplied to Kubernetes workloads through Kubernetes Secrets.



The deployed service configuration uses references such as:



env:

&#x20; - name: SPRING_DATASOURCE_USERNAME

&#x20;   valueFrom:

&#x20;     secretKeyRef:

&#x20;       name: cake-db-secret

&#x20;       key: POSTGRES_USERNAME



&#x20; - name: SPRING_DATASOURCE_PASSWORD

&#x20;   valueFrom:

&#x20;     secretKeyRef:

&#x20;       name: cake-db-secret

&#x20;       key: POSTGRES_PASSWORD



The container therefore receives the credentials at runtime instead of storing them directly in the Docker image.



11. Container Ports



The services expose the following application ports:



Component	Port

API Gateway	8091

Catalog Service	8081

Order Service	8082

Rating Service	8083

Notification Service	8084

RabbitMQ AMQP	5672

RabbitMQ Management	15672



The application port is also reflected by the corresponding Docker and Kubernetes configuration.



12. Container Build Lifecycle



The backend container lifecycle is:



Source Code

&#x20;   ↓

Maven Compilation

&#x20;   ↓

Spring Boot Executable JAR

&#x20;   ↓

Docker Build

&#x20;   ↓

Docker Image

&#x20;   ↓

Kubernetes Deployment

&#x20;   ↓

Running Container / Pod

13. Example Build Process



For the Order Service:



cd services/order-service

mvn clean package -DskipTests



Then:



docker build -t cakedelight/order-service:1.2 .



The image can then be referenced by the Kubernetes deployment:



image: cakedelight/order-service:1.2

14. Kubernetes Image Deployment



The Kubernetes deployment configuration references the container image.



Example:



containers:

&#x20; - name: order-service

&#x20;   image: cakedelight/order-service:1.2

&#x20;   imagePullPolicy: IfNotPresent

&#x20;   ports:

&#x20;     - containerPort: 8082



After applying the updated manifest:



kubectl apply -f .\\k8s\\order-service.yaml



the deployment is rolled out using:



kubectl rollout status deployment/order-service -n cake-delight

15. Deployment Verification



The running container image can be verified using:



kubectl get pods -n cake-delight -l app=order-service `

&#x20; -o jsonpath="{.items\[0].spec.containers\[0].image}"



The verified deployment returned:



cakedelight/order-service:1.2

16. Container Health



The Kubernetes deployments use Spring Boot Actuator health endpoints through Kubernetes probes where configured.



For the Order Service, the deployment defines:



/actuator/health/liveness

/actuator/health/readiness



This allows Kubernetes to determine container health and readiness.



17. Advantages Demonstrated



Containerization provides the project with:



Consistent runtime environments

Independent service packaging

Independent service deployment

Portable application images

Clear versioned image tags

Separation of build and runtime environments

Integration with Kubernetes orchestration

18. Containerization Summary



The Cake Delight backend is containerized as independently deployable Spring Boot services.



The services are packaged as executable JARs, copied into Java 17 runtime images, and deployed as Kubernetes workloads.



Environment variables and Kubernetes Secrets provide deployment-specific configuration without embedding database credentials into the runtime image.



The containerization approach supports the cloud-native requirement for portable, independently deployable services.

