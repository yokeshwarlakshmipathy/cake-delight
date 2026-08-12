\# Cake Delight - Event Contract



\## 1. Overview



Cake Delight uses RabbitMQ for asynchronous communication between the Order Service and Notification Service.



The purpose of the event-driven workflow is to decouple order completion from notification processing.



The Order Service acts as the event producer.



The Notification Service acts as the event consumer.



\---



\## 2. Event Flow



The implemented event flow is:



```text

Customer Checkout

&#x20;      ↓

Order Service

&#x20;      ↓

Order Created

&#x20;      ↓

Order Status = COMPLETED

&#x20;      ↓

ORDER\_COMPLETED Event

&#x20;      ↓

RabbitMQ

&#x20;      ↓

order.completed.queue

&#x20;      ↓

Notification Service

&#x20;      ↓

OrderCompletedListener

&#x20;      ↓

Create Order Confirmation

&#x20;      ↓

notification\_db







3\. Event Name



The event represents successful order completion.



Logical event name:



ORDER\_COMPLETED



The event is published after the Order Service successfully completes checkout.



4\. Event Payload



The Order Service publishes the information required by the Notification Service to create an order confirmation.



The implemented event contains:



Field	Type	Description

orderId	Long	Identifier of the completed order

userId	Long	Identifier of the customer



The corresponding consumer-side event model is:



public record OrderCompletedEvent(

&#x20;   Long orderId,

&#x20;   Long userId

) {

}

5\. Producer



The event producer is implemented in the Order Service.



The checkout process performs the following steps:



1\. Retrieve user's basket

2\. Validate that the basket is not empty

3\. Create Order

4\. Create Order Items

5\. Save Order

6\. Set order status to COMPLETED

7\. Save updated Order

8\. Publish ORDER\_COMPLETED event

9\. Clear the basket



The event is associated with the completed order and user.



6\. Message Broker



The application uses:



RabbitMQ



RabbitMQ is deployed as a Kubernetes workload and exposed internally through the Kubernetes service:



rabbitmq:5672



RabbitMQ management is available on:



rabbitmq:15672



where the configured environment permits management access.



7\. Queue



The Notification Service declares and listens to:



order.completed.queue



The queue is defined in the Notification Service RabbitMQ configuration.



The listener is associated with this queue.



8\. Consumer



The Notification Service contains an OrderCompletedListener.



The listener uses Spring AMQP:



@RabbitListener(

&#x20;   queues = RabbitMQConfig.ORDER\_COMPLETED\_QUEUE

)



The listener receives:



OrderCompletedEvent



and invokes the notification business service using the event's:



orderId

userId

9\. Consumer Processing



When an ORDER\_COMPLETED event is consumed, the Notification Service:



Receives the order ID and user ID.

Creates an order-confirmation notification.

Sets the notification type to:

ORDER\_CONFIRMATION

Creates the notification message.

Sets the notification status to:

SENT

Persists the notification in notification\_db.

10\. Notification Message



The generated notification message follows the implemented format:



Your Cake Delight order #<orderId> has been confirmed successfully.



Example:



Your Cake Delight order #16 has been confirmed successfully.

11\. Stored Notification Example



A successfully processed event results in a notification record similar to:



{

&#x20; "id": 14,

&#x20; "userId": 101,

&#x20; "orderId": 16,

&#x20; "type": "ORDER\_CONFIRMATION",

&#x20; "message": "Your Cake Delight order #16 has been confirmed successfully.",

&#x20; "status": "SENT",

&#x20; "createdAt": "2026-08-12T08:42:05.193891"

}



The exact identifier and timestamp depend on the runtime data.



12\. Event-Driven Sequence

┌───────────────┐

│    Customer   │

└───────┬───────┘

&#x20;       │

&#x20;       │ Checkout

&#x20;       ▼

┌───────────────────┐

│   Order Service   │

└─────────┬─────────┘

&#x20;         │

&#x20;         │ Create / complete order

&#x20;         ▼

┌───────────────────┐

│      Order DB     │

└───────────────────┘



&#x20;         │

&#x20;         │ ORDER\_COMPLETED

&#x20;         ▼

┌───────────────────┐

│      RabbitMQ     │

│ order.completed   │

│      .queue       │

└─────────┬─────────┘

&#x20;         │

&#x20;         │ Consume event

&#x20;         ▼

┌────────────────────────┐

│ Notification Service   │

│ OrderCompletedListener │

└───────────┬────────────┘

&#x20;           │

&#x20;           │ Create confirmation

&#x20;           ▼

┌────────────────────────┐

│   Notification DB      │

└────────────────────────┘

13\. Synchronous vs Asynchronous Communication



Cake Delight uses two communication patterns.



Synchronous



Client-facing operations use HTTP/REST:



Frontend

&#x20;  ↓

API Gateway

&#x20;  ↓

Backend Service



Examples include:



GET /api/cakes

GET /api/baskets/{userId}

GET /api/orders/{orderId}

GET /api/ratings/cake/{cakeId}

Asynchronous



Order confirmation uses messaging:



Order Service

&#x20;  ↓

RabbitMQ

&#x20;  ↓

Notification Service



This prevents the Order Service from requiring a synchronous Notification Service request to complete the event-driven workflow.



14\. Event Ownership



The event ownership is:



Event Producer:

Order Service



Message Broker:

RabbitMQ



Queue:

order.completed.queue



Event Consumer:

Notification Service



Persistence:

notification\_db

15\. Verification



The event-driven notification flow has been verified in the running Kubernetes environment.



The Notification Service successfully connects to RabbitMQ and persists order-confirmation notifications.



Verified notification records include completed orders such as:



Order #13

Order #14

Order #15

Order #16



with:



type   = ORDER\_CONFIRMATION

status = SENT



The Notification Service runtime logs also show database insert operations after event processing.



16\. Assessment Requirement Mapping



This implementation satisfies the event-driven portion of the capstone requirement:



Order completion

&#x20;     ↓

Publish event

&#x20;     ↓

Message broker

&#x20;     ↓

Notification consumer

&#x20;     ↓

Order confirmation notification



The design demonstrates asynchronous communication between independently deployable microservices using RabbitMQ.



17\. Error Handling and Scope



The current implementation focuses on the successful order-completion notification workflow.



The capstone implementation does not claim external email or SMS delivery unless separately configured.



The notification record is persisted with a SENT status as part of the implemented notification workflow.



18\. Summary



The event contract provides a clear asynchronous boundary between order processing and notification processing.



The Order Service owns the order-completion event, RabbitMQ transports the event, and the Notification Service consumes the event and creates the corresponding order-confirmation notification.



This demonstrates loose coupling and event-driven communication in the Cake Delight cloud-native architecture.

