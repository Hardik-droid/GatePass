# GatePass Backend Architecture

## Overview

GatePass backend is a FastAPI service that owns the production workflow:

event creation -> ticket category creation -> order creation -> payment confirmation -> ticket issue -> signed QR generation -> email outbox -> scanner validation -> dashboard metrics -> reports -> settlements -> audit logs -> GPS/geofence alerts.

The frontend should treat this backend as an HTTP API. It should not import backend code directly.

## Runtime

- Framework: FastAPI
- Validation: Pydantic v2
- Local server: Uvicorn
- Dev persistence: in-memory store in `backend/app/core/store.py`
- Production persistence target: Neon Postgres

## Folder Structure

```text
backend/
  requirements.txt
  README.md
  app/
    main.py
    schemas.py
    core/
      config.py
      errors.py
      security.py
      store.py
    routers/
      api.py
    services/
      analytics.py
      audit.py
      events.py
      gps.py
      notifications.py
      orders.py
      qr.py
      scanner.py
```

## Request Flow

1. Public user opens event data from `GET /api/events/{slug}`.
2. User books via `POST /api/orders`.
3. Dev/manual payment confirms through `POST /api/orders/{order_id}/manual-confirm`.
4. Backend marks order paid and issues tickets.
5. Each ticket receives a unique signed QR token.
6. Only the QR token hash is stored.
7. Confirmation email is written to notification outbox.
8. Scanner submits QR token to `POST /api/scanner/validate`.
9. Backend verifies signature, token hash, event, ticket status, and duplicate state.
10. Dashboard, reports, settlement, and audit endpoints read from backend state.

## Security Model

The current FastAPI backend has development header-based role checks:

```http
x-gatepass-role: OWNER
x-gatepass-role: EVENT_MANAGER
x-gatepass-role: FINANCE_MANAGER
x-gatepass-role: SCANNER_STAFF
```

Production should replace this with Neon Auth session/JWT validation. The permission model is centralized in `backend/app/core/security.py`.

Important rules enforced by backend services:

- QR tokens are signed opaque payloads.
- QR tokens do not include personal data.
- Stored ticket token data is only a SHA-256 hash.
- Scanner validation is server-side.
- Duplicate scans return `ALREADY_USED`.
- Cancelled, refunded, and expired tickets are rejected.
- Key state changes create audit logs.
- Email outbox stores redacted HTML and does not persist raw QR tokens.

## Core Services

### Events

File: `backend/app/services/events.py`

Responsibilities:

- Create event
- Generate slug
- List events
- Load public event by slug
- Create/list ticket categories
- Audit event/category creation

### Orders and Tickets

File: `backend/app/services/orders.py`

Responsibilities:

- Create order
- Calculate gross, platform fee, gateway fee, and net amount
- Mark order paid
- Issue tickets only after payment confirmation
- Generate one unique QR token per ticket
- Store QR token hash
- Trigger confirmation email outbox
- Audit order/payment/ticket lifecycle

### QR

File: `backend/app/services/qr.py`

QR token format:

```text
gpqr.<base64url-json-payload>.<hmac-signature>
```

Payload:

```json
{
  "version": "v1",
  "event_id": "...",
  "ticket_id": "...",
  "nonce": "..."
}
```

No name, phone, email, or payment information is encoded.

### Scanner

File: `backend/app/services/scanner.py`

Validation checks:

- token shape
- HMAC signature
- token hash exists
- QR payload matches ticket
- event match
- ticket status
- duplicate check-in

Returned states include:

- `VALID`
- `ALREADY_USED`
- `INVALID`
- `WRONG_EVENT`
- `CANCELLED`
- `REFUNDED`
- `EXPIRED`

### Notifications

File: `backend/app/services/notifications.py`

Current behavior:

- Writes confirmation email outbox row
- Marks as `dev_previewed` when Resend is not configured
- Stores redacted HTML, not raw QR token

Production behavior to add:

- Send through Resend API
- Retry failed outbox rows
- Persist provider message IDs

### Analytics, Reports, Settlements

File: `backend/app/services/analytics.py`

Responsibilities:

- Dashboard metrics
- Sales and attendance report rows
- Settlement formula:

```text
gross sales
- platform fees
- gateway fees
- refunds
= net settlement
```

Manual collection visibility is tracked separately.

### GPS Gatepass

File: `backend/app/services/gps.py`

Responsibilities:

- Create gatepass request
- Log GPS location
- Calculate geofence distance
- Create outside-geofence audit alert

## API Surface

Main routes are registered in `backend/app/routers/api.py`.

Important endpoints:

```text
GET  /api/health
GET  /api/events
POST /api/events
GET  /api/events/{slug}
GET  /api/ticket-categories
POST /api/ticket-categories
POST /api/orders
GET  /api/orders
POST /api/orders/{order_id}/manual-confirm
POST /api/payments/dev-simulator/{order_id}
POST /api/scanner/validate
POST /api/scanner/manual-lookup
GET  /api/tickets
GET  /api/me/tickets
GET  /api/dashboard
GET  /api/reports
GET  /api/settlements/{event_id}
GET  /api/communications
GET  /api/audit
POST /api/gatepass/request
POST /api/gps/log-location
```

## Production Migration Plan

1. Replace `backend/app/core/store.py` with Neon Postgres repository classes if the FastAPI service becomes the primary backend.
2. Validate Neon Auth sessions/JWTs in `security.py`.
3. Enforce database-level policies where applicable and keep server-side authorization checks.
4. Implement real Razorpay order creation and webhook signature verification.
5. Implement real Resend email delivery and retry worker.
6. Add pytest service/API tests.
7. Deploy FastAPI separately from Next.js.

## Local Development

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open:

```text
http://localhost:8000/docs
```
