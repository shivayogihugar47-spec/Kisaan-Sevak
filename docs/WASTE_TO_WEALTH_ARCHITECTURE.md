# Waste to Wealth Platform Architecture

## 1. Vision
Build a trust-first circular-economy marketplace for agri-waste where farmers can list residue, buyers can discover verified supply, and the platform orchestrates bidding, logistics, settlement, and impact reporting in one flow.

## 2. Core goals
- Help farmers monetize crop residue instead of burning it.
- Create a trusted B2B marketplace with transparent pricing.
- Reduce waste, emissions, and financial leakage.
- Enable end-to-end execution from listing to payment release.

## 3. Actors
- Farmer: creates listings, sets reserve price, confirms pickup.
- Buyer / Enterprise: evaluates offers, bids, accepts auctions, receives goods.
- Logistics partner: confirms pickup and delivery status.
- Admin / verifier: approves KYC, resolves disputes, monitors fraud.
- Platform operator: oversees pricing, nudges, notifications, and reporting.

## 4. System architecture

### 4.1 Frontend layer
- React + Vite + Tailwind
- Mobile-first experience for field users
- Role-based screens for farmers, buyers, and admins
- Existing app entry points:
  - [src/pages/WasteToWealthPage.jsx](src/pages/WasteToWealthPage.jsx)
  - [src/context/AuthContext.jsx](src/context/AuthContext.jsx)
  - [src/components/Header.jsx](src/components/Header.jsx)

### 4.2 API layer
- Local API handlers mounted under `/api/*`
- Existing handlers:
  - [api/marketplace-auctions.js](api/marketplace-auctions.js)
  - [api/marketplace-bids.js](api/marketplace-bids.js)
  - [api/marketplace-transactions.js](api/marketplace-transactions.js)
- Planned modules:
  - [api/marketplace-escrow.js](api/marketplace-escrow.js)
  - [api/marketplace-logistics.js](api/marketplace-logistics.js)
  - [api/marketplace-payments.js](api/marketplace-payments.js)
  - [api/marketplace-impact.js](api/marketplace-impact.js)

### 4.3 Data layer
- Neon Postgres as the source of truth
- SQL schema documented in [data/neon-storage-schema.sql](data/neon-storage-schema.sql)
- Main entities:
  - `app_users`
  - `auctions`
  - `auction_bids`
  - `marketplace_transactions`
  - `escrow_payments`
  - `logistics_events`
  - `impact_records`

## 5. Functional modules

### A. Identity and trust
- Farmer and buyer KYC profile
- Verified phone, location, business profile
- Reputation and history score

### B. Listing and pricing
- Residue type, quantity, quality grade, photos, pickup window
- Reserve price, expected payout, market benchmark

### C. Marketplace engine
- Instant offer flow
- Auction flow with bid acceptance
- Reserved price rules and expiry windows

### D. Escrow and settlement
- Lock escrow on accepted bid
- Release payment after delivery confirmation
- Prevent premature payout

### E. Logistics
- Pickup schedule request
- Delivery proof and milestone updates
- Route-based coordination for partner fleets

### F. Impact and carbon reporting
- CO2 emissions avoided
- Digital impact certificate per contract
- Optional carbon credits integration

### G. Notifications and support
- WhatsApp/SMS/Email notifications
- Dispute ticketing
- Farmer support chat

## 6. End-to-end workflow
```mermaid
flowchart LR
A[Farmer Registers] --> B[KYC Verified]
B --> C[Create Residue Listing]
C --> D[Pricing + Buyer Match]
D --> E[Instant Offer or Auction]
E --> F[Accept Bid]
F --> G[Escrow Locked]
G --> H[Pickup Scheduled]
H --> I[Delivery Confirmed]
I --> J[Payment Released]
J --> K[Impact Certificate Issued]
```

## 7. API contract outline

### Marketplace auction endpoints
- POST `/api/marketplace-auctions` creates an auction
- GET `/api/marketplace-auctions` lists auctions and bids
- PATCH `/api/marketplace-auctions` closes and accepts a bid

### Marketplace bid endpoints
- POST `/api/marketplace-bids` creates a bid

### Marketplace transaction endpoints
- POST `/api/marketplace-transactions` creates an escrow-style lifecycle record
- PATCH `/api/marketplace-transactions` advances a milestone
- GET `/api/marketplace-transactions` lists current transaction state

### Planned endpoints
- POST `/api/marketplace-escrow` creates/updates escrow state
- POST `/api/marketplace-logistics` records pickup and delivery events
- POST `/api/marketplace-payments` releases settlement amounts
- GET `/api/marketplace-impact` provides impact analytics

## 8. Data model summary

### `auctions`
- `id`
- `seller_id`
- `seller_phone`
- `seller_name`
- `residue_type`
- `quantity_tons`
- `base_price_total`
- `allowed_buyer_types`
- `status`
- `expires_at`
- `accepted_bid_id`

### `auction_bids`
- `id`
- `auction_id`
- `buyer_id`
- `buyer_phone`
- `buyer_name`
- `buyer_type`
- `amount_total`

### `marketplace_transactions`
- `id`
- `auction_id`
- `bid_id`
- `seller_name`
- `buyer_name`
- `status`
- `created_at`
- `updated_at`

### `escrow_payments`
- `id`
- `transaction_id`
- `amount`
- `currency`
- `status`

### `logistics_events`
- `id`
- `transaction_id`
- `event_type`
- `actor_name`
- `notes`

### `impact_records`
- `id`
- `transaction_id`
- `co2_saved_tons`
- `certificate_id`

## 9. Security and trust controls
- Role-based authorization per actor
- Server-side validation for bids, amounts, and statuses
- Audit trail of every state transition
- Fraud detection for suspicious high-volume bidding
- Data protection for phone and KYC details

## 10. Scaling plan
- Keep the current local API + Neon pattern for MVP
- Add caching for repeated market benchmarks
- Introduce queue-based notifications in production
- Add WebSocket or polling for real-time bidding updates
- Add image and document storage for verified listings

## 11. Implementation status in this repo
- UI flow exists in [src/pages/WasteToWealthPage.jsx](src/pages/WasteToWealthPage.jsx)
- Marketplace API exists in [api/marketplace-auctions.js](api/marketplace-auctions.js) and [api/marketplace-bids.js](api/marketplace-bids.js)
- Transaction milestone flow exists in [api/marketplace-transactions.js](api/marketplace-transactions.js)
- Full escrow, logistics, payments, and impact modules are the next implementation layer

## 12. Recommended next build steps
1. Add escrow API and record state transitions.
2. Add pickup and delivery confirmation flow with QR or OTP validation.
3. Add payment release workflow and payout ledger.
4. Add impact certificate generation and admin dashboard.
5. Add multilingual voice-first experience for rural users.
