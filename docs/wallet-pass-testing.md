# Wallet Pass Testing

## Dev Simulator Flow

1. Start the app with `npm run dev`.
2. Open `/book/demo-concert`.
3. Book a pass with the dev/manual payment path.
4. Confirm the success panel shows QR pass, Apple Wallet, and Google Wallet actions.
5. Open `/app/pass/:ticketId?token=:rawToken`.
6. Confirm the QR renders and the wallet buttons are present.
7. Open `/dashboard/communications` and confirm the email preview/outbox row includes wallet status.

## Real Apple Wallet Testing

1. Set all Apple Wallet env vars.
2. Use HTTPS for `NEXT_PUBLIC_APP_URL` and `APPLE_WALLET_WEB_SERVICE_URL`.
3. Book a ticket on an iPhone or macOS Safari.
4. Click Add to Apple Wallet.
5. Confirm inside Apple Wallet.
6. Scan the wallet QR at `/scanner`.

## Real Google Wallet Testing

1. Set all Google Wallet env vars.
2. Ensure `GOOGLE_WALLET_ORIGIN` matches the production HTTPS origin.
3. Book a ticket on Android or Chrome.
4. Click Add to Google Wallet.
5. Confirm inside Google Wallet.
6. Scan the wallet QR at `/scanner`.

## Scanner Validation

Use the same QR token from the website pass, email preview, Apple Wallet payload, or Google Wallet object. First scan must return `VALID`. Second scan must return `ALREADY USED`.

## Rejection Tests

Mark a ticket as `cancelled`, `refunded`, or `expired`, then scan its QR. The scanner must return the matching invalid state and must not check in the ticket.

## Email Preview Test

Without `RESEND_API_KEY`, bookings create a `dev_previewed` outbox entry with View Pass, Apple Wallet, and Google Wallet links. This is intentional and must not be presented as real provider delivery.
