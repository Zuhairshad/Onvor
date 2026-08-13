# Phase E — Controlled Order Proposal (Gate 3, NOT YET APPROVED)

This is a **proposal for a single controlled real order**, not a test that has been run. Nothing in this file has been executed. Nothing will be executed without explicit written approval that references this file. Payment details are entered ONLY by the authorized store owner or an authorized customer — the operator running this test will not read, log, request, or enter card details.

The proposal is written against the production Shopify shop behind `theonvor.com` because it is the only target available. Phase D reconnaissance saw no Bogus Gateway or test-mode indicators on the checkout page. **Do not enable Shopify Payments test mode or Bogus Gateway on the live production shop** — that would interfere with real customer traffic.

## 1. Exact product and variant

| Field | Value |
|---|---|
| Product | Stamp Tee - Black (`stamp-tee-black`) |
| Variant | Size L, `gid://shopify/ProductVariant/52163534061849` |
| Quantity | **1** |
| Rationale | Same variant used in Phases C and D — mid-inventory (15 units), price and currency already reconciled |

## 2. Expected charge (ESTIMATES ONLY)

Every number below is an **estimate**. The authoritative total is whatever the Shopify checkout displays after the shipping address has been entered and before Pay is clicked. If the on-screen total does not match the estimate within a tight tolerance (see abort criteria in §8), the run is aborted.

| Line | Estimated amount | Source | Notes |
|---|---|---|---|
| Item subtotal | Rs 1,679.30 | Confirmed in Phases C and D — Storefront API `cart.cost.subtotalAmount` and hosted checkout DOM | Reliable |
| Shipping | **Unknown until the real shipping address is entered.** Phase D saw a placeholder row of Rs 225.00 in the pre-address checkout DOM, but Shopify treats that as an unconfigured-address estimate. The final rate depends on the destination address, weight, and shipping profile. | Phase D placeholder only | Estimate |
| Tax | **Unknown.** For PK domestic delivery, tax may be Rs 0 or non-zero depending on the shop's tax settings and whether prices are marked "tax-included". For cross-border, sales tax / VAT may apply. **Owner must confirm the applicable tax rule for the chosen address before Pay.** | Not observable pre-address | Estimate |
| Discount | Rs 0 (no discount will be applied unless the owner explicitly supplies a code) | Confirmed in Phases C and D | Reliable |
| **Expected total (very rough, PK domestic, no tax)** | **~Rs 1,679.30 to ~Rs 1,904.30** | Item subtotal + placeholder shipping band, no tax assumed | **ESTIMATE ONLY — do not treat as authoritative.** |
| Gateway / payment processing fee | Absorbed by the merchant per transaction (Shopify Payments and most gateways charge a percentage + fixed fee per transaction; the fee is charged even if the order is refunded, though some gateways refund the percentage portion). | Merchant billing — not shown in checkout | Owner must accept as a cost of testing. |

## 3. Payment method

**Do not enable test-mode payments on the live production shop.** Live Shopify Payments test mode or Bogus Gateway would break real customer traffic while enabled.

**Only acceptable option:** the authorized store owner (or an authorized customer they designate) uses a real card, on their own device, at their own hand.

- The operator running this test **will not read, log, request, screenshot, or enter card details.** No screen-share of card entry either.
- The owner enters card details on the checkout page and clicks Pay themselves.
- After Pay, the owner reports the order id (or last-4 of the confirmation email) so the operator can pick up the cancel/refund/restock step from the Admin side — see §7.

**Excluded methods:** third-party or unrelated cards, gift cards, discount codes (unless owner explicitly requests one be tested and supplies it), Shop Pay saved wallets, one-tap pay from any device that isn't the owner's own, Apple/Google Pay from a non-owner device, buy-now-pay-later.

## 4. Test identity

| Field | Value | Who supplies |
|---|---|---|
| Email | Owner-supplied sentinel address. Pattern suggestion: `qa+onvor-e2e-<yyyy-mm-dd>@<owner-domain>` | Owner |
| First name | `E2E` | Fixed |
| Last name | `TEST — DO NOT FULFILL` | Fixed |
| Order note (if the checkout exposes a "notes" field) | `HEADLESS E2E TEST — DO NOT FULFILL — CANCEL & REFUND WITHIN 10 MIN` | Fixed |
| Shipping address | Owner-supplied real address (Shopify requires a real address for shipping calc; recommend owner's own address so any accidental shipment lands with the owner) | Owner |
| Phone | Owner-supplied real phone (some checkout flows validate via SMS) | Owner |
| Marketing / SMS opt-in | Both **unchecked** | Fixed |

## 5. Expected inventory effect (tracked separately)

Shopify tracks three distinct inventory quantities that shift at different lifecycle points. The Storefront API only exposes `quantityAvailable` (= on_hand − committed − reserved − damaged − safety_stock, per Shopify's inventory-states docs), so the proposal must be re-checked from Admin for the other two. The Admin API resource is `InventoryLevel` on the store's default fulfillment location.

| Quantity | Read from | Baseline (pre-order) | Immediately after order paid | After cancel + refund with "restock" | After cancel + refund WITHOUT restock |
|---|---|---|---|---|---|
| `available` (Storefront `quantityAvailable`) | Storefront API — read now | 15 | 14 (expected) | 15 (expected) | 14 (permanent gap unless manually adjusted) |
| `committed` (goods reserved to open orders) | Admin `InventoryLevel.quantities(names: ["committed"])` — **requires Admin access, not yet requested** | 0 for our variant (assumed; must be re-read pre-test) | +1 | back to prior | back to prior |
| `on_hand` (physical stock the merchant records at the location) | Admin `InventoryLevel.quantities(names: ["on_hand"])` — **requires Admin access** | current on-hand (must be recorded pre-test) | unchanged (Shopify decrements `available` and increments `committed`, not `on_hand`, until fulfillment ships) | unchanged | unchanged |

**Practical consequence:**
- If restock is checked at refund time: `available` returns to baseline, `committed` returns to baseline, `on_hand` was never touched — full round-trip.
- If restock is NOT checked at refund time: `available` stays 1 short; the owner must manually adjust on-hand via Admin to close the gap.
- Owner should record pre-test values for all three quantities from Admin before Pay is clicked, and re-check all three post-cleanup.

If Admin access is not granted before the run, the `committed` and `on_hand` values remain **unverifiable via Storefront**, and the run's inventory verification is limited to `available` only. Owner must decide if that is acceptable.

## 6. Fulfillment, email, and app automations — required confirmations before Gate 3 approval

The 10-minute cleanup window is only sufficient if none of these automations fire between order-paid and cancel-refund. Each must be confirmed by the owner before approval — do not assume defaults.

| Automation | Question for owner | Why it matters |
|---|---|---|
| Automatic fulfillment | Is auto-fulfill enabled for this shop, this product, or this location? Can it be paused (shop-wide or SKU-specific) for the test window? | If auto-fulfill fires before the 10-minute cancel, the order becomes non-cancellable via the standard cancel-and-refund flow and requires a returns/reversal path. |
| Warehouse or supplier forwarding | Does the shop forward orders to a 3PL, warehouse system, or supplier email at order-paid? | Forwarded orders may be picked/packed before cancellation reaches them. |
| Shipping-label auto-print / carrier API | Is there any integration that generates a label or hands off to a carrier on order-paid? | Even if inventory can be restocked, a printed/paid label may not be reversible. |
| Order-confirmation email to customer | Confirmed on by default. Can it be suppressed for the sentinel address? | Cannot suppress pre-order in Shopify; will be sent. Sentinel email needs to be one that won't confuse a real customer or trigger unrelated flows. |
| Order-notification email/SMS to staff | Who receives it? | Notify staff in advance that a test order is incoming and must not be manually fulfilled. |
| ERP / accounting sync (Xero, QuickBooks, ODOO, etc.) | Any integration syncing orders/invoices to accounting? | Order will post an invoice; refund will post a reversal. Both will show in accounting records permanently. |
| Loyalty / rewards app | Does the customer earn points on order-paid? | Points may accrue to the sentinel customer; must be zeroed after cancel. |
| Marketing automation (Klaviyo, Mailchimp, SMS platforms) | Any flow triggered by order-paid, or by customer-created? | Sentinel customer may be enrolled in post-purchase flows; must be suppressed at the automation platform. |
| Product-review request (Judge.me, Loox, native) | Auto-scheduled for the sentinel customer? | Must be suppressed. |
| Analytics / pixels (GA4, Meta, TikTok, Pinterest, Snapchat, Klaviyo web tracker) | Which pixels fire `purchase`? | A `purchase` event will be logged in every analytics platform; refunds may or may not post a `refund` event. Owner should expect this signal in reports. |
| Shopify Fraud Analysis | Any custom fraud rules that would flag the sentinel identity? | If flagged as high risk, the order may hold pre-capture — that actually helps us cancel cleanly, but the owner should be aware. |
| Third-party inventory sync (marketplace listings, POS) | Is inventory synced to Amazon / eBay / physical POS? | The `available` decrement and re-increment will propagate to those systems; expect a brief window where the marketplace listing shows one fewer unit. |
| Subscription / recurring-billing apps | Not applicable (no subscription products) | — |
| Gift-card apps | Not applicable (not buying a gift card) | — |
| Transaction and refund fees | Confirm the owner accepts the non-recoverable gateway fee as a cost of testing. Some gateways refund the percentage; most do not refund the fixed per-transaction fee. | Real money cost. Must be an accepted line item. |

## 7. Who does what — division of labor

| Step | Actor | Notes |
|---|---|---|
| Pre-test: read baseline `available`, `committed`, `on_hand` from Admin | Owner | Operator can help if given Admin API read access. |
| Pre-test: suppress/pause every automation listed in §6 that owner elects to pause | Owner | Some automations cannot be paused; those become risks. |
| Add sentinel item to cart on the headless preview | Operator | Same variant as Phases C & D. |
| Navigate to hosted checkout | Operator | Same as Phase D — no interaction beyond navigation. |
| Enter shipping address, contact email/phone | Owner | On owner's device, at owner's hand. |
| Enter card details | Owner | On owner's device. Operator does not observe. |
| Click Pay | Owner | Owner confirms the on-screen total matches §2 estimates within tolerance (see §8) before clicking. |
| Record order id from Admin | Owner or Operator (whoever has Admin open) | Order id will be redacted in all evidence. |
| Cancel + refund + check "Restock" | Owner (preferred) or Operator if given Admin write access | Must complete within 10 minutes of Pay, subject to §6 automations having been contained. |
| Re-read `available`, `committed`, `on_hand` from Admin | Owner or Operator | Compare to baseline. |
| Erase customer personal data (Shopify GDPR request) | Owner | See §8 on what remains after erasure. |
| Sanitize and write the test record | Operator | Redact order id, customer id, payment reference, address. |

## 8. What Shopify retains even after erasure

Shopify's "Erase personal data" (GDPR endpoint) removes PII from the customer record, but **does not** remove the following. Owner must accept that these traces persist:

- **Order record:** the order id, currency, subtotal, tax, shipping, total, line items, and refund history are retained. The customer name/email/address is replaced with a placeholder, but the order itself remains queryable in Admin, Reports, and via the Admin API indefinitely (or until the shop is deleted).
- **Transaction / payment ledger:** Shopify Payments and the gateway retain the transaction, authorization, and refund records for regulatory and accounting reasons. These may be visible in Payouts, Bills, and financial exports for years (statutory retention varies by jurisdiction — commonly 7 years).
- **Refund transactions:** the refund is itself a permanent ledger entry.
- **Fulfillment records:** if any fulfillment was created before cancel, its record remains.
- **Analytics aggregates:** any `purchase` event that fired to GA4/Meta/TikTok/Klaviyo before cancel is retained by those platforms per their own retention policies. Refund events (where fired) may reduce reported revenue but do not remove the underlying event.
- **Audit log / staff activity log:** every change made in Admin is recorded and retained per Shopify plan (30 days on Basic, longer on higher plans).
- **Third-party integrations:** any system that ingested the order (ERP, 3PL, marketplace sync) retains its own copy. Erasing the customer in Shopify does not propagate.
- **Email delivery logs:** order confirmation, refund confirmation, and cancellation emails are logged in the deliverability tool (Shopify Email, or third-party ESP) and cannot be recalled after send.
- **Session tokens (`_s`, `_y`, `_r`) and IP address:** may persist in Shopify's analytics store per their privacy policy.

**Conclusion for §8:** we cannot promise a "clean" delete. We can promise PII replacement on the customer record, cancellation of the order, and refund + restock of the payment/inventory — nothing more.

## 9. Abort criteria

Abort (do not click Pay, close the tab, restart with a fresh cart) if any of the following are true:

| Condition | Reason |
|---|---|
| Checkout displays a saved wallet (Shop Pay one-tap, Apple Pay, Google Pay, saved-card auto-fill) | The isolated context leaked — start over from a fresh browser profile. |
| On-screen total > Rs 3,000 (double the item subtotal + a generous shipping band) | Something is wrong (wrong region, wrong tax rule, wrong currency, wrong quantity). |
| Currency displayed is not PKR | Wrong market. |
| More than one line item is present | Cart contamination. |
| Any automation in §6 that owner intended to pause is still visibly firing (e.g. staff Slack notification during setup) | Cleanup window is not safe. |
| Owner is not personally at the Admin console ready to cancel | 10-minute window cannot be guaranteed. |

## 10. Cancellation / refund / restock procedure (owner performs, operator can assist if given Admin access)

Time budget: **≤10 minutes from Pay to Cancel-and-Refund complete.** If any automation in §6 fires within that window and cannot be reversed, the run is a partial failure and must be documented as such.

1. Admin → Orders → open the newly-created order (identifiable by sentinel email + last name `TEST — DO NOT FULFILL`).
2. Cancel order → reason "Other → test order" → **check "Refund payment"** and **check "Restock items"** in the cancel modal.
3. Confirm the refund posts successfully in Payments (may take a few seconds to a few minutes depending on gateway).
4. Verify `available` returned to baseline via Storefront API `quantityAvailable`.
5. Verify `committed` returned to baseline via Admin `InventoryLevel` (if Admin access granted).
6. Verify `on_hand` is unchanged from baseline via Admin `InventoryLevel` (if Admin access granted).
7. Verify order-confirmation, refund-confirmation, cancellation emails arrived in the sentinel inbox; record arrival times.
8. Cross-check each automation in §6 for firing evidence; unwind any that did fire (e.g. remove the customer from a Klaviyo flow, cancel a 3PL forward, delete a scheduled review request).
9. Admin → Customers → find sentinel customer → **Erase personal data** (GDPR).
10. Operator writes the test record: order id (redacted to last-4), payment status (refunded), refund amount, gateway fee absorbed, inventory delta table (baseline/paid/post-cancel across available/committed/on_hand), automations fired vs suppressed vs unwound, PII-erasure status, retained-record disclaimer per §8.

## 11. What Phase E does NOT cover

- Multi-item orders (only 1 line, 1 unit).
- Discount code application (out of scope unless owner requests and supplies a code).
- Guest vs logged-in checkout comparison (no accounts flow implemented in headless).
- Any second test order (single order only).
- Shop Pay Installments / BNPL flows.
- Gift-card purchase or redemption.
- International shipping (unless owner chooses an international test address).

**Status:** DRAFT — waiting for approval. See §12 for the missing decisions that block approval.

## 12. Missing decisions — Gate 3 blocker list

| # | Required decision | Why it is necessary | Safe available options | Recommendation | Risk if unanswered |
|---|---|---|---|---|---|
| 1 | Sentinel email address (real inbox the owner can monitor) | Order-confirmation / refund / cancel emails will be sent to this address. It must (a) belong to the owner or a QA account they control, (b) not be a random inbox that could confuse a customer, and (c) not be enrolled in any real customer flow. | (i) `qa+onvor-e2e-<date>@<owner-domain>` if the owner runs a real domain; (ii) an existing internal QA mailbox already used for other test flows. **Do not use** `qa+headless-e2e@onvor.local` (not a real inbox). | Owner provides a real, monitored plus-alias mailbox. | Cannot run — no way to confirm email delivery, no address for Shopify to send the required order emails to. |
| 2 | Shipping address for the test | Shopify requires a real, deliverable address to compute shipping and to accept payment. | (i) Owner's own home/office address; (ii) any real Onvor staff address the owner controls. | Owner's own address, so any accidental shipment lands with the owner. | Cannot run — no shipping calc, no payment step. |
| 3 | Contact phone number | Required by some checkout flows / SMS validation. | Owner's real phone or a staff QA number. | Owner's real phone. | Checkout may block progress at contact step. |
| 4 | Payment method — real card owner authorizes | Live shop; test-mode payments must not be enabled. Real card must be used, and only by the owner. | Owner's personal card, or a company card the owner is authorized to use for testing. | Owner's own card, entered by the owner on the owner's device. | Cannot run — operator will not enter card details. |
| 5 | Admin API read access for `InventoryLevel` (nice-to-have) | Only way to verify `committed` and `on_hand` separately from `available`. | (i) Shopify Admin API token with `read_inventory` scope, provided out-of-band; (ii) owner reads the values manually from Admin at each checkpoint. | Owner provides a read-only Admin API token, OR agrees to read the numbers manually and paste them back. | Inventory verification limited to `available` only; `committed`/`on_hand` claims cannot be verified. |
| 6 | Admin write access for the cancel/refund/restock step (owner-preferred alternative: owner performs it) | The cleanup must complete within 10 minutes. Either the owner performs it themselves or the operator is granted Admin write access for that window. | (i) Owner performs cancel/refund/restock; (ii) owner grants operator temporary Admin access (`Orders: Edit`, `Refunds: Manage`); (iii) owner does it while operator watches over screen share. | (i) — owner performs the cleanup. Cleanest, no elevated access for operator. | If neither party is at the Admin console when Pay fires, the 10-minute window is missed and the risk profile of §6 grows sharply. |
| 7 | Explicit confirmation on each automation in §6 (fulfillment, warehouse forward, label print, staff notification, ERP, loyalty, marketing, analytics, fraud, marketplace sync, gateway fee acceptance) | Some cannot be paused; those become known risks the owner must accept. Some can be paused (auto-fulfill in particular); those must be paused before Pay. | Owner walks through §6 and marks each row: `pause` / `cannot pause — accept` / `not applicable`. | Owner provides a filled-in §6 checklist as part of the approval message. | Cleanup window is unsafe. Any missed automation that fires becomes a permanent record we cannot reverse. |
| 8 | Test window (date/time in owner's timezone) | Owner must be at the Admin console; automations must be pre-suppressed. | Any owner-nominated window; ~30 min uninterrupted is ideal. | Weekday, business hours, when the shop has low order volume so staff aren't distracted. | If unannounced, staff may fulfill the order manually. |
| 9 | Explicit acceptance of non-recoverable costs (gateway fee, analytics event, retained ledger records per §8) | Real money, real analytics distortion, permanent records that "erase personal data" won't remove. | Owner acknowledges. | Acknowledge in the approval message. | If owner later disputes the fee or the retained records, the operator is in a false position. |
| 10 | Approval sentence naming this file by path | Traceability. | Owner writes: `Approved to place Phase E test order per reports/phase-e-controlled-order-proposal.md — see §12 answers below`. | Include §12 answers inline. | Ambiguity about scope of approval. |

**Status remains:** DRAFT — no Gate 3 approval. Stop here and wait for the owner's response to §12.
