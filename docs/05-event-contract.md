# Cake Delight - Event Contract

## 1. Overview

Cake Delight uses RabbitMQ for asynchronous communication between the Order Service and Notification Service.

The purpose of the event-driven workflow is to decouple order completion from notification processing.

This implementation creates a persisted in-app notification record after checkout. It does not implement external email or SMS delivery; the Notification Service only stores the notification and marks its status as `SENT`.

The Order Service acts as the event producer.

The Notification Service acts as the event consumer.

## 2. Event Flow

The implemented event flow is:

```text
Customer Checkout
      ↓
Order Service
      ↓
Order Created
      ↓
Order Status = COMPLETED
      ↓
ORDER_COMPLETED Event
      ↓
RabbitMQ
      ↓
order.completed.queue
      ↓
Notification Service
      ↓
OrderCompletedListener
      ↓
Create Order Confirmation
      ↓
notification_db
```

## 3. Event Name

The event represents successful order completion.

Logical event name:

```text
ORDER_COMPLETED
```

The event is published after the Order Service successfully completes checkout.

## 4. Event Payload

The Order Service publishes the information required by the Notification Service to create an order confirmation.

The implemented event contains:

| Field | Type | Description |
| --- | --- | --- |
| `orderId` | Long | Identifier of the completed order |
| `userId` | Long | Identifier of the customer |

The corresponding consumer-side model is:

```java
public record OrderCompletedEvent(
    Long orderId,
    Long userId
) {
}
```

## 5. Producer

The event producer is implemented in the Order Service.

The checkout process performs the following steps:

1. Retrieve the user's basket.
2. Validate that the basket is not empty.
3. Create the order and order items.
4. Save the order.
5. Set the order status to `COMPLETED`.
6. Publish the `ORDER_COMPLETED` event.
7. Clear the basket.

## 6. Message Broker

The application uses RabbitMQ.

RabbitMQ is deployed as a Kubernetes workload and exposed internally through the service:

```text
rabbitmq:5672
```

The management UI is exposed on:

```text
rabbitmq:15672
```

## 7. Queue

The Notification Service declares and listens to:

```text
order.completed.queue
```

This queue is defined in the Notification Service RabbitMQ configuration and is consumed by the listener.

## 8. Consumer

The Notification Service contains an `OrderCompletedListener`.

It uses Spring AMQP and listens on the configured queue:

```java
@RabbitListener(queues = RabbitMQConfig.ORDER_COMPLETED_QUEUE)
```

The listener receives the `OrderCompletedEvent` and invokes notification creation using the event's `orderId` and `userId` values.

## 9. Consumer Processing

When an `ORDER_COMPLETED` event is consumed, the Notification Service:

- receives the order ID and user ID
- creates an order-confirmation notification record
- sets the notification type to `ORDER_CONFIRMATION`
- creates the notification message
- sets the notification status to `SENT`
- persists the notification in `notification_db`

This is a database-backed in-app notification flow. No real email or SMS sender is implemented in this project.

## 10. Notification Message

The generated notification message follows the implemented format:

```text
Your Cake Delight order #<orderId> has been confirmed successfully.
```

Example:

```text
Your Cake Delight order #16 has been confirmed successfully.
```

## 11. Stored Notification Example

A successfully processed event results in a notification record similar to:

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

## 12. Event-Driven Sequence

```text
Customer
   ↓
Order Service
   ↓
Order DB
   ↓
ORDER_COMPLETED
   ↓
RabbitMQ
   ↓
Notification Service
   ↓
Notification DB
```

## 13. Communication Patterns

The project uses both synchronous and asynchronous communication:

### Synchronous

Client-facing operations use HTTP/REST through the API Gateway:

- `GET /api/cakes`
- `GET /api/baskets/{userId}`
- `GET /api/orders/{orderId}`
- `GET /api/ratings/cake/{cakeId}`

### Asynchronous

Order confirmation uses messaging:

```text
Order Service → RabbitMQ → Notification Service
```

This prevents the Order Service from requiring a synchronous Notification Service request during the event-driven flow.

## 14. Ownership

- Event Producer: Order Service
- Message Broker: RabbitMQ
- Queue: `order.completed.queue`
- Event Consumer: Notification Service
- Persistence: `notification_db`

## 15. Verification

The event-driven notification flow is implemented in the repository and is aligned with the actual code path in the Order Service and Notification Service.
