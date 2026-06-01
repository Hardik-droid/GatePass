# GatePass Wallet Passes

GatePass wallet passes use the same secure QR token as the website pass and confirmation email. The QR contains a signed opaque GatePass token only. It does not encode attendee email, phone, payment details, or raw personal data.

## Apple Wallet

Apple Wallet requires an Apple Developer account, a Pass Type ID, a PassKit signing certificate, the Apple WWDR certificate, and a production web service URL.

Required environment:

- `APPLE_PASS_TYPE_IDENTIFIER`
- `APPLE_TEAM_IDENTIFIER`
- `APPLE_PASS_CERT_PATH`
- `APPLE_PASS_CERT_PASSWORD`
- `APPLE_WWDR_CERT_PATH`
- `APPLE_WALLET_WEB_SERVICE_URL`
- `APPLE_WALLET_ORGANIZATION_NAME`
- `APPLE_WALLET_DESCRIPTION`
- `APPLE_WALLET_LOGO_TEXT`

Apple certificate files must not be committed. Keep them outside the repository and point the env vars to the server-local paths. When credentials are missing, GatePass returns a structured unavailable response and keeps checkout, QR, email, and scanner flows working.

Apple update web service endpoints are implemented under:

- `/api/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber`
- `/api/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier`
- `/api/wallet/apple/v1/passes/:passTypeIdentifier/:serialNumber`
- `/api/wallet/apple/v1/log`

## Google Wallet

Google Wallet requires a Google Wallet issuer, service account, private key, allowed origin, and Event Ticket class/object setup.

Required environment:

- `GOOGLE_WALLET_ISSUER_ID`
- `GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_WALLET_PRIVATE_KEY`
- `GOOGLE_WALLET_EVENT_TICKET_CLASS_SUFFIX`
- `GOOGLE_WALLET_ORIGIN`
- `GOOGLE_WALLET_USE_EVENT_TICKET`

Google save links are generated server-side. Private keys never enter browser code. When credentials are missing, GatePass shows Google Wallet as temporarily unavailable instead of claiming a fake save.

## Shared Security

Required production environment:

- `QR_SIGNING_SECRET`
- `WALLET_LINK_SIGNING_SECRET`
- `WALLET_PASS_BASE_URL`
- `NEXT_PUBLIC_APP_URL`

Email wallet links are signed and short-lived. Scanner validation always goes through the normal scanner endpoint, regardless of whether the QR came from the website, email, Apple Wallet, Google Wallet, or a downloaded fallback.

## Local Dev Limitations

Local dev can issue tickets, generate signed QR tokens, prepare wallet pass records, show wallet buttons, create dev email previews, and return structured provider-unavailable states. Real Apple `.pkpass` signing and real Google Wallet save JWTs require production credentials.

## Production Checklist

- Configure QR and wallet signing secrets.
- Configure Apple Pass Type ID, team ID, certificate, password, WWDR cert, and web service URL.
- Configure Google issuer ID, service account email, private key, class suffix, and origin.
- Run Supabase migration `002_wallet_passes.sql`.
- Verify booking creates ticket, QR, email preview/outbox, wallet pass records, and audit events.
- Verify scanner returns `VALID` once and `ALREADY USED` on duplicate scan.
- Verify cancelled/refunded/expired tickets are rejected.
- Verify communications and orders dashboards show wallet status.
