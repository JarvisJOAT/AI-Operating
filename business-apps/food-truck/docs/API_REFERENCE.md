# Food Truck API Reference

Complete API documentation for the Food Truck backend service.

## Base URL

```
Development: http://localhost:3002
Production:  https://your-food-truck-api.com
```

---

## Menu Endpoints

### List Menu Categories

```http
GET /api/menu/categories
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Plates",
    "description": "BBQ plates with sides",
    "order_index": 1
  }
]
```

### Get Menu Items by Category

```http
GET /api/menu/items?category_id={category_id}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "category_id": "uuid",
    "name": "Brisket Plate",
    "description": "Sliced brisket with 2 sides",
    "price": 18.99,
    "is_available": true,
    "image_url": "https://...",
    "options": [
      {
        "name": "Meat Amount",
        "choices": ["Regular", "Extra (+$5)"]
      }
    ]
  }
]
```

### Create Menu Item

```http
POST /api/menu/items
```

**Request:**
```json
{
  "category_id": "uuid",
  "name": "New Item",
  "description": "Description",
  "price": 15.99,
  "is_available": true
}
```

### Update Menu Item

```http
PUT /api/menu/items/:id
```

**Request:**
```json
{
  "price": 17.99,
  "is_available": false
}
```

### Delete Menu Item

```http
DELETE /api/menu/items/:id
```

---

## Order Endpoints

### Create Order

```http
POST /api/orders
```

**Request:**
```json
{
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "customer_email": "john@example.com",
  "items": [
    {
      "menu_item_id": "uuid",
      "quantity": 2,
      "special_instructions": "Extra sauce",
      "selected_options": {
        "Meat Amount": "Regular"
      }
    }
  ],
  "pickup_time": "2024-01-15T12:30:00Z",
  "notes": "Will call when arriving"
}
```

**Response:**
```json
{
  "id": "order-uuid",
  "order_number": "ORD-001",
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "items": [...],
  "subtotal": 37.98,
  "tax": 3.13,
  "total": 41.11,
  "status": "pending",
  "estimated_ready_time": "2024-01-15T12:45:00Z",
  "created_at": "2024-01-15T12:30:00Z"
}
```

### Get Order

```http
GET /api/orders/:id
```

**Response:**
```json
{
  "id": "order-uuid",
  "order_number": "ORD-001",
  "status": "preparing",
  "items": [...],
  "total": 41.11,
  "payment_status": "paid",
  "estimated_ready_time": "2024-01-15T12:45:00Z"
}
```

### List Orders

```http
GET /api/orders?status=pending&date=2024-01-15
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `status` | string | Filter by status |
| `date` | string | Filter by date |
| `limit` | number | Max results (default: 50) |
| `offset` | number | Pagination offset |

### Update Order Status

```http
PUT /api/orders/:id/status
```

**Request:**
```json
{
  "status": "ready"
}
```

**Valid Statuses:**
- `pending` - Order received
- `confirmed` - Order confirmed
- `preparing` - Being prepared
- `ready` - Ready for pickup
- `completed` - Picked up
- `cancelled` - Cancelled

### Cancel Order

```http
POST /api/orders/:id/cancel
```

**Request:**
```json
{
  "reason": "Customer requested"
}
```

---

## Customer Endpoints

### Create Customer

```http
POST /api/customers
```

**Request:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com"
}
```

### Get Customer by Phone

```http
GET /api/customers/phone/:phone
```

### Get Customer Order History

```http
GET /api/customers/:id/orders
```

---

## Voice Endpoints

### Incoming Call Webhook

```http
POST /api/voice/incoming
```

Twilio sends:
```
CallSid=CA123...
From=+1234567890
To=+0987654321
```

Returns TwiML response.

### Process Speech

```http
POST /api/voice/process
```

Twilio sends:
```
CallSid=CA123...
SpeechResult=I would like a brisket plate
Confidence=0.95
```

### End Call

```http
POST /api/voice/end
```

### Get Conversation

```http
GET /api/voice/conversation/:callSid
```

**Response:**
```json
{
  "callSid": "CA123...",
  "customerPhone": "+1234567890",
  "transcript": [
    { "role": "assistant", "content": "Welcome to..." },
    { "role": "user", "content": "I'd like a brisket plate" }
  ],
  "orderId": "order-uuid",
  "duration": 120,
  "status": "completed"
}
```

---

## Payment Endpoints

### Create Payment Intent

```http
POST /api/payments/create-intent
```

**Request:**
```json
{
  "order_id": "order-uuid"
}
```

**Response:**
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "amount": 4111,
  "currency": "usd"
}
```

### Confirm Payment

```http
POST /api/payments/confirm
```

**Request:**
```json
{
  "order_id": "order-uuid",
  "payment_intent_id": "pi_xxx"
}
```

### Payment Webhook

```http
POST /api/payments/webhook
```

Stripe webhook events handled:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Process Cash Payment

```http
POST /api/payments/cash
```

**Request:**
```json
{
  "order_id": "order-uuid",
  "amount_received": 50.00
}
```

**Response:**
```json
{
  "success": true,
  "change_due": 8.89
}
```

### Refund Payment

```http
POST /api/payments/refund
```

**Request:**
```json
{
  "order_id": "order-uuid",
  "amount": 41.11,
  "reason": "Customer request"
}
```

---

## Notification Endpoints

### Send Order Confirmation

```http
POST /api/notifications/order-confirmation
```

**Request:**
```json
{
  "order_id": "order-uuid",
  "channels": ["sms", "email"]
}
```

### Send Ready Notification

```http
POST /api/notifications/order-ready
```

**Request:**
```json
{
  "order_id": "order-uuid"
}
```

### Get Notification Status

```http
GET /api/notifications/:id
```

**Response:**
```json
{
  "id": "notif-uuid",
  "order_id": "order-uuid",
  "type": "order_ready",
  "channel": "sms",
  "status": "delivered",
  "sent_at": "2024-01-15T12:45:00Z",
  "delivered_at": "2024-01-15T12:45:02Z"
}
```

---

## Analytics Endpoints

### Get Daily Summary

```http
GET /api/analytics/daily?date=2024-01-15
```

**Response:**
```json
{
  "date": "2024-01-15",
  "total_orders": 45,
  "total_revenue": 1250.50,
  "average_order_value": 27.79,
  "orders_by_hour": {
    "11": 5,
    "12": 12,
    "13": 8,
    ...
  },
  "top_items": [
    { "name": "Brisket Plate", "count": 25 },
    { "name": "Ribs Plate", "count": 18 }
  ]
}
```

### Get Popular Items

```http
GET /api/analytics/popular-items?period=week
```

---

## Error Responses

### Error Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Invalid request data |
| `NOT_FOUND` | 404 | Resource not found |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `ORDER_CANCELLED` | 409 | Order already cancelled |
| `ITEM_UNAVAILABLE` | 409 | Menu item not available |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Webhooks

### Twilio Voice Webhook

Configure in Twilio Dashboard:
- URL: `https://your-domain.com/api/voice/incoming`
- Method: POST
- Content-Type: application/x-www-form-urlencoded

### Twilio SMS Webhook

Configure in Twilio Dashboard:
- URL: `https://your-domain.com/api/sms/incoming`
- Method: POST

### Stripe Webhook

Configure in Stripe Dashboard:
- URL: `https://your-domain.com/api/payments/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Order creation | 10/minute per IP |
| Menu queries | 100/minute |
| Payment endpoints | 30/minute |
| Voice webhooks | Unlimited |

---

## SDK Examples

### JavaScript

```javascript
// Create order
const createOrder = async (orderData) => {
  const response = await fetch('http://localhost:3002/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return response.json();
};

// Get order status
const getOrderStatus = async (orderId) => {
  const response = await fetch(`http://localhost:3002/api/orders/${orderId}`);
  return response.json();
};
```

### cURL

```bash
# Create order
curl -X POST http://localhost:3002/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"John","items":[{"menu_item_id":"uuid","quantity":1}]}'

# Update order status
curl -X PUT http://localhost:3002/api/orders/order-uuid/status \
  -H "Content-Type: application/json" \
  -d '{"status":"ready"}'
```

