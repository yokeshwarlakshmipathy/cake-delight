\# Cake Delight - API Documentation



\## 1. Overview



The Cake Delight backend exposes REST APIs through the API Gateway.



Base URL for local Kubernetes testing:



```text

http://127.0.0.1:8091



The API Gateway routes requests to the corresponding microservice.



| Service        | Gateway Route           | Internal Port |

| -------------- | ----------------------- | ------------: |

| Catalog        | `/api/cakes/\*\*`         |          8081 |

| Order / Basket | `/api/baskets/\*\*`       |          8082 |

| Order          | `/api/orders/\*\*`        |          8082 |

| Rating         | `/api/ratings/\*\*`       |          8083 |

| Notification   | `/api/notifications/\*\*` |          8084 |





2\. Catalog Service APIs

2.1 Create Cake

POST /api/cakes

Request

{

&#x20; "name": "Chocolate Truffle Cake",

&#x20; "description": "Rich chocolate cake with truffle frosting",

&#x20; "category": "Chocolate",

&#x20; "price": 899.00,

&#x20; "available": true,

&#x20; "imageUrl": "https://example.com/chocolate-truffle.jpg"

}

Response

201 Created



Returns the created cake.



2.2 Get Cakes

GET /api/cakes



Returns all available catalog records handled by the Catalog Service.



Optional Filters

name

category

minPrice

maxPrice



Example:



GET /api/cakes?name=chocolate\&category=Chocolate\&minPrice=600\&maxPrice=1000



The filters can also be used independently.



Examples:



GET /api/cakes?name=chocolate

GET /api/cakes?category=Chocolate

GET /api/cakes?minPrice=600\&maxPrice=800



The Catalog Service combines supplied filters when more than one is provided.



2.3 Get Cake by ID

GET /api/cakes/{id}



Example:



GET /api/cakes/1



Returns the selected cake.



2.4 Update Cake

PUT /api/cakes/{id}



Updates an existing cake.



2.5 Delete Cake

DELETE /api/cakes/{id}



Deletes a catalog record.



Response

204 No Content

3\. Basket APIs



The basket APIs are provided by the Order Service.



3.1 Get Basket

GET /api/baskets/{userId}



Example:



GET /api/baskets/101



Example response:



{

&#x20; "id": 1,

&#x20; "userId": 101,

&#x20; "items": \[

&#x20;   {

&#x20;     "id": 15,

&#x20;     "cakeId": 1,

&#x20;     "quantity": 2,

&#x20;     "unitPrice": 899.00,

&#x20;     "subtotal": 1798.00

&#x20;   }

&#x20; ],

&#x20; "totalAmount": 1798.00

}

3.2 Add Cake to Basket

POST /api/baskets/{userId}/items



Example:



POST /api/baskets/101/items

Request

{

&#x20; "cakeId": 1,

&#x20; "quantity": 2

}



The service calculates the item subtotal and basket total.



3.3 Update Basket Item

PUT /api/baskets/{userId}/items/{itemId}

Request

{

&#x20; "quantity": 3

}



The basket totals are recalculated after the quantity change.



3.4 Remove Basket Item

DELETE /api/baskets/{userId}/items/{itemId}



Removes the selected basket item and recalculates the basket total.



4\. Order APIs

4.1 Checkout

POST /api/orders/checkout

Request

{

&#x20; "userId": 101

}

Successful Response

201 Created



Example:



{

&#x20; "id": 16,

&#x20; "userId": 101,

&#x20; "totalAmount": 3396.00,

&#x20; "status": "COMPLETED",

&#x20; "createdAt": "2026-08-12T08:42:05.193891",

&#x20; "items": \[

&#x20;   {

&#x20;     "id": 16,

&#x20;     "cakeId": 3,

&#x20;     "quantity": 1,

&#x20;     "unitPrice": 699.00,

&#x20;     "subtotal": 699.00

&#x20;   },

&#x20;   {

&#x20;     "id": 17,

&#x20;     "cakeId": 1,

&#x20;     "quantity": 3,

&#x20;     "unitPrice": 899.00,

&#x20;     "subtotal": 2697.00

&#x20;   }

&#x20; ]

}



During checkout the Order Service:



Reads the user's basket.

Validates that the basket is not empty.

Creates the order.

Creates the order items.

Persists the order.

Marks the order as completed.

Publishes the order-completion event.

Clears the basket after successful processing.

4.2 Get Order by ID

GET /api/orders/{orderId}



Example:



GET /api/orders/16



Returns the complete order and order items.



4.3 Get Orders by User

GET /api/orders/user/{userId}



Example:



GET /api/orders/user/101



Returns the user's order history ordered by creation time, newest first.



5\. Rating APIs

5.1 Create Rating

POST /api/ratings

Request

{

&#x20; "userId": 101,

&#x20; "cakeId": 1,

&#x20; "rating": 5,

&#x20; "comment": "Fresh and delicious!"

}

Successful Response

201 Created

Validation



The rating must satisfy:



1 <= rating <= 5



The review comment can contain a maximum of 1000 characters.



5.2 Duplicate Rating



A user can only submit one rating for the same cake.



If the same user attempts to rate the same cake again, the service rejects the duplicate rating and the frontend displays:



User has already rated this cake.

5.3 Get Cake Ratings

GET /api/ratings/cake/{cakeId}



Example:



GET /api/ratings/cake/1



Returns ratings and review comments for the selected cake.



5.4 Get Average Cake Rating

GET /api/ratings/cake/{cakeId}/average



Example:



GET /api/ratings/cake/1/average



Returns the average rating and rating count.



6\. Notification APIs

## 6.1 Create Order Confirmation

```http
POST /api/notifications/order-confirmation?userId={userId}&orderId={orderId}
```

Example:

```http
POST /api/notifications/order-confirmation?userId=101&orderId=16
```

### Query Parameters

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `userId` | Long | Yes | User receiving the notification |
| `orderId` | Long | Yes | Order associated with the notification |

### Successful Response

```http
201 Created
```

The response contains the created notification:

```json
{
  "id": 14,
  "userId": 101,
  "orderId": 16,
  "type": "ORDER_CONFIRMATION",
  "message": "Your Cake Delight order #16 has been confirmed successfully.",
  "status": "SENT",
  "createdAt": "2026-08-12T08:42:05.193891"
}
```

The Notification Service also creates order-confirmation notifications automatically when it receives the order-completion event from RabbitMQ.

Your other notification endpoints are exactly:

```http
GET /api/notifications/user/{userId}
GET /api/notifications/order/{orderId}
```

So that section is now fully aligned with the controller you've actually implemented.

### One important distinction for the documentation

There are two ways an order-confirmation notification can be created:

```text
Manual REST API:
POST /api/notifications/order-confirmation?userId=101&orderId=16

Event-driven flow:
Order Service
    ↓
ORDER_COMPLETED
    ↓
RabbitMQ
    ↓
Notification Service
    ↓
createOrderConfirmation()
```

For the capstone, the event-driven path is the important one, because that directly satisfies the requirement to send order confirmation after successful checkout.

Your verified notification records show this is functioning for completed orders.

## 6.2 Get Notifications by User

GET /api/notifications/user/{userId}



Example:



GET /api/notifications/user/101



Example response:



\[

&#x20; {

&#x20;   "id": 14,

&#x20;   "userId": 101,

&#x20;   "orderId": 16,

&#x20;   "type": "ORDER\_CONFIRMATION",

&#x20;   "message": "Your Cake Delight order #16 has been confirmed successfully.",

&#x20;   "status": "SENT",

&#x20;   "createdAt": "2026-08-12T08:42:05.193891"

&#x20; }

]

6.3 Get Notifications by Order

GET /api/notifications/order/{orderId}



Example:



GET /api/notifications/order/16



Returns notifications associated with the selected order.



7\. Health APIs



The backend services expose Spring Boot Actuator endpoints for operational health information.



The exposed management endpoints include:



/actuator/health

/actuator/info



These endpoints are used by Kubernetes health/readiness configuration where applicable.



8\. API Gateway



The client should use the API Gateway as the primary HTTP entry point.



Client

&#x20;  ↓

API Gateway :8091



The gateway routes requests as follows:



/api/cakes/\*\*          → catalog-service:8081

/api/baskets/\*\*        → order-service:8082

/api/orders/\*\*         → order-service:8082

/api/ratings/\*\*        → rating-service:8083

/api/notifications/\*\* → notification-service:8084



Clients should therefore not depend on internal Pod IP addresses.



9\. Representative End-to-End API Flow

Step 1 - Browse Cakes

GET /api/cakes

Step 2 - Filter Cakes

GET /api/cakes?category=Chocolate\&minPrice=600\&maxPrice=1000

Step 3 - Add Cake

POST /api/baskets/101/items

Step 4 - View Basket

GET /api/baskets/101

Step 5 - Checkout

POST /api/orders/checkout

Step 6 - Retrieve Order

GET /api/orders/{orderId}

Step 7 - View Order History

GET /api/orders/user/101

Step 8 - Submit Rating

POST /api/ratings

Step 9 - View Ratings

GET /api/ratings/cake/{cakeId}

Step 10 - View Notifications

GET /api/notifications/user/101

10\. Error and Validation Behavior



The application validates request data at service boundaries.



Examples include:



Required cake name

Required category

Positive cake price

Rating between 1 and 5

Maximum review comment length

Non-empty basket required for checkout

Duplicate rating prevention

Missing resource handling



The frontend displays user-friendly messages for important business errors such as duplicate ratings and checkout failures.



11\. API Testing



The APIs were validated through the running API Gateway and Kubernetes deployment.



Representative verified operations include:



GET /api/cakes

GET /api/orders/user/101

GET /api/orders/{orderId}

GET /api/notifications/user/101

POST /api/orders/checkout

POST /api/ratings



The API layer supports the complete customer workflow from catalog browsing through checkout, order history, ratings, and notification retrieval.

