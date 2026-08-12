# Cake Delight - Database Design



## 1. Overview



Cake Delight follows service-owned persistence.



Each core microservice maintains its own database:



| Service | Database |

|---|---|

| Catalog Service | `catalog_db` |

| Order Service | `order_db` |

| Rating Service | `rating_db` |

| Notification Service | `notification_db` |



The services do not use a single shared application database.



This supports separation of business responsibilities and independent service ownership.



\---



# 2. Catalog Database



Database:



```text

catalog_db



The Catalog Service stores cake product information.



2.1 Cake Entity



Table:



cakes



The Cake entity contains the following business information:



Column	Purpose

id	Unique cake identifier

name	Cake name

description	Cake description

category	Cake category

price	Current cake price

available	Availability status

image_url / image reference	Product image reference



The exact database column naming is generated according to the JPA entity mapping.



2.2 Catalog Filtering



The Catalog Service supports filtering using:



name

category

minPrice

maxPrice



The service uses JPA Specifications to construct dynamic filtering criteria.



Example:



name = Chocolate

category = Chocolate

minPrice = 600

maxPrice = 1000



The filters are combined at the service/repository level before retrieving the results.



3. Order Database



Database:



order_db



The Order Service owns basket and order information.



The major entities are:



Basket

BasketItem

Order

OrderItem

3.1 Basket



Table:



baskets



The Basket represents a user's current shopping basket.



Main attributes include:



Field	Purpose

id	Basket identifier

userId	User associated with the basket

totalAmount	Current basket total

items	Basket items



A basket contains multiple Basket Items.



Relationship:



Basket

&#x20;  │

&#x20;  └── 1 : N

&#x20;         │

&#x20;         ▼

&#x20;    BasketItem

3.2 Basket Item



Table:



basket_items



A Basket Item represents a cake selected by the user.



Main attributes include:



Field	Purpose

id	Basket item identifier

cakeId	Catalog cake identifier

quantity	Requested quantity

unitPrice	Price stored for the basket item

subtotal	Quantity × unit price

basket	Parent basket



The Order Service calculates basket subtotals and the overall basket total.



4. Order Entity



Table:



orders



The Order represents a completed checkout transaction.



Main attributes include:



Field	Purpose

id	Order identifier

userId	User who placed the order

totalAmount	Total order value

status	Current order state

createdAt	Order creation timestamp

items	Order items



Relationship:



Order

&#x20;  │

&#x20;  └── 1 : N

&#x20;         │

&#x20;         ▼

&#x20;      OrderItem



The current implementation uses order statuses such as:



CREATED

COMPLETED



During the current checkout flow the order is ultimately marked as:



COMPLETED

5. Order Item



Table:



order_items



An Order Item stores the cake information captured when the order is created.



Main attributes include:



Field	Purpose

id	Order item identifier

cakeId	Catalog cake identifier

quantity	Ordered quantity

unitPrice	Price captured at checkout

subtotal	Quantity × unit price

order	Parent order



The order item retains the price used for the transaction.



Relationship:



Order

&#x20; │

&#x20; ├── OrderItem

&#x20; ├── OrderItem

&#x20; └── OrderItem

6. Order Database Relationships



The main order-domain relationship is:



Basket

&#x20; │

&#x20; └── BasketItem



and:



Order

&#x20; │

&#x20; └── OrderItem



The checkout process converts the current basket items into order items.



Conceptually:



Basket

&#x20; ↓

Basket Items

&#x20; ↓

Checkout

&#x20; ↓

Order

&#x20; ↓

Order Items



After successful checkout, the basket is cleared.



7. Rating Database



Database:



rating_db



The Rating Service owns cake rating and review data.



7.1 Rating Entity



Table:



ratings



Main attributes include:



Field	Purpose

id	Rating identifier

userId	User who submitted the rating

cakeId	Cake being rated

rating	Rating value from 1 to 5

comment	Optional review comment

createdAt	Rating creation timestamp



Relationship:



Cake

&#x20; │

&#x20; │ referenced by cakeId

&#x20; ▼

Rating



The Rating Service maintains the rating data independently from the Catalog Service.



8. Rating Constraints



The rating request validates:



rating >= 1

rating <= 5



Review comments can contain up to 1000 characters.



The current business rule also prevents a user from rating the same cake more than once.



The uniqueness rule is implemented through the repository lookup:



existsByUserIdAndCakeId(...)



This allows the service to reject duplicate submissions.



9. Average Rating



The Rating Service calculates the average rating using the stored ratings for a cake.



Conceptually:



Average Rating =

Sum of Ratings / Number of Ratings



The API also returns the number of submitted ratings.



Example:



{

&#x20; "cakeId": 1,

&#x20; "average": 4.50,

&#x20; "count": 10

}



The actual returned value depends on the ratings stored for the cake.



10. Notification Database



Database:



notification_db



The Notification Service owns notification records generated from order completion.



10.1 Notification Entity



Table:



notifications



Main attributes include:



Field	Purpose

id	Notification identifier

userId	User receiving the notification

orderId	Associated order

type	Notification type

message	Notification message

status	Delivery/status value

createdAt	Notification creation timestamp



The current notification type is:



ORDER_CONFIRMATION



The successful notification status is:



SENT

11. Notification Relationship



Notifications are associated with orders using:



orderId



and with customers using:



userId



The Notification Service does not own the Order database. It stores the identifiers required for the notification business capability.



Conceptually:



Order Service

&#x20;     │

&#x20;     │ ORDER_COMPLETED event

&#x20;     ▼

Notification Service

&#x20;     │

&#x20;     ▼

notifications

12. Cross-Service References



The microservices do not use direct database foreign keys across service boundaries.



Examples:



Order Item

&#x20;  cakeId

&#x20;     ↓

Catalog Service cake identifier



and:



Rating

&#x20;  cakeId

&#x20;     ↓

Catalog Service cake identifier



and:



Notification

&#x20;  orderId

&#x20;     ↓

Order Service order identifier



These are logical references communicated through APIs and events rather than cross-database foreign key constraints.



13. Persistence Ownership



The ownership model is:



Catalog Service

&#x20;  ↓

catalog_db

&#x20;  └── cakes





Order Service

&#x20;  ↓

order_db

&#x20;  ├── baskets

&#x20;  ├── basket_items

&#x20;  ├── orders

&#x20;  └── order_items





Rating Service

&#x20;  ↓

rating_db

&#x20;  └── ratings





Notification Service

&#x20;  ↓

notification_db

&#x20;  └── notifications



This structure allows each service to evolve its business data independently.



14. Database Configuration



The application source configuration uses environment variables for PostgreSQL connection values:



SPRING_DATASOURCE_URL

SPRING_DATASOURCE_USERNAME

SPRING_DATASOURCE_PASSWORD



Kubernetes supplies the username and password through the configured Kubernetes Secret.



The services use Hibernate/JPA for persistence.



The current development configuration uses:



ddl-auto: update



This allows the application to update the database schema from the JPA model during development.



15. Test Database Configuration



Automated Spring Boot context tests use isolated H2 in-memory databases.



The test databases are separate from the PostgreSQL application databases:



Catalog tests       → H2

Order tests         → H2

Rating tests        → H2

Notification tests  → H2



The test configuration uses:



ddl-auto: create-drop



so the test schema is created for the test execution and discarded afterward.



16. Database Security Practice



Database credentials are not stored as the previous plaintext PostgreSQL password values in the service source configuration.



Application configuration uses environment-variable placeholders.



In Kubernetes, the database username and password are supplied through:



cake-db-secret



This keeps deployment credentials separate from application source code.



17. Database Design Summary



The database architecture follows the microservice ownership model:



&#x20;            ┌─────────────────┐

&#x20;            │ Catalog Service  │

&#x20;            │   catalog_db     │

&#x20;            └────────┬────────┘

&#x20;                     │

&#x20;                   cakes



&#x20;            ┌─────────────────┐

&#x20;            │  Order Service   │

&#x20;            │    order_db      │

&#x20;            └────────┬────────┘

&#x20;                     │

&#x20;         ┌───────────┴───────────┐

&#x20;         │                       │

&#x20;      baskets                  orders

&#x20;         │                       │

&#x20;    basket_items             order_items



&#x20;            ┌─────────────────┐

&#x20;            │ Rating Service   │

&#x20;            │    rating_db     │

&#x20;            └────────┬────────┘

&#x20;                     │

&#x20;                   ratings



&#x20;            ┌────────────────────┐

&#x20;            │ Notification       │

&#x20;            │ Service            │

&#x20;            │ notification_db    │

&#x20;            └─────────┬──────────┘

&#x20;                      │

&#x20;                 notifications



The design keeps business data separated by service while using REST APIs and events to exchange the identifiers and information required for cross-service workflows.

