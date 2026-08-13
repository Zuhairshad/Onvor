#!/usr/bin/env bash
# Phase D - restricted checkout handoff (no payment).
# Fresh isolated context: curl with no cookies + headless Chrome with a
# throwaway user-data-dir (no Shop Pay session, no prior auth).
# Zero writes beyond one cart create + navigating to the returned checkoutUrl.
set -euo pipefail

cd "$(dirname "$0")/../../.."
source .env.local
DOMAIN=$(echo "$SHOPIFY_STORE_DOMAIN" | sed -E 's|^https?://||;s|/$||')
API_VER="${SHOPIFY_API_VERSION:-2026-07}"
TOKEN="$SHOPIFY_STOREFRONT_ACCESS_TOKEN"
ENDPOINT="https://${DOMAIN}/api/${API_VER}/graphql.json"

PREVIEW="https://onvor.vercel.app"
EVIDENCE="reports/evidence/phase-d"
mkdir -p "$EVIDENCE"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
CHROME_PROFILE="$(mktemp -d -t phase-d-chrome-profile)"
trap 'rm -rf "$CHROME_PROFILE"' EXIT

# ---------- helpers ----------
sf() {
  local query="$1" vars="${2:-{\}}" outfile="$3"
  curl -s -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Shopify-Storefront-Private-Token: $TOKEN" \
    -d "$(jq -cn --arg q "$query" --argjson v "$vars" '{query: $q, variables: $v}')" \
    -o "$outfile"
}

redact() {
  # Redact ?key=... and any full checkoutUrl-shaped values in place
  perl -i -pe 's/\?key=[A-Za-z0-9]+/\?key=[REDACTED]/g' "$1"
  perl -i -pe 's|(https?://[^\s"]+/checkouts?/c[on]?/)[A-Za-z0-9]+|${1}[REDACTED-TOKEN]|g' "$1"
  perl -i -pe 's|(https?://[^\s"]+/cart/c/)[A-Za-z0-9]+|${1}[REDACTED-TOKEN]|g' "$1"
}

echo "======================================================"
echo "Phase D - checkout handoff (no payment)"
echo "Preview:  $PREVIEW"
echo "Endpoint: $ENDPOINT"
echo "Chrome:   $CHROME"
echo "Profile:  $CHROME_PROFILE (throwaway, deleted on exit)"
echo "Started:  $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "======================================================"

# ---------- 1. baseline product/inventory ----------
echo ""
echo "[1] Baseline: stamp-tee-black variant L"
sf 'query GetProduct($handle: String!) {
  product(handle:$handle) {
    id title handle
    variants(first:20){edges{node{
      id title availableForSale quantityAvailable
      selectedOptions{name value}
      price{amount currencyCode}
    }}}
  }
}' '{"handle":"stamp-tee-black"}' "$EVIDENCE/01-baseline.json"

VARIANT_L_ID=$(jq -r '.data.product.variants.edges[]|select(.node.selectedOptions[]|select(.name=="Size" and .value=="L"))|.node.id' "$EVIDENCE/01-baseline.json")
QTY_BASELINE=$(jq -r '.data.product.variants.edges[]|select(.node.selectedOptions[]|select(.name=="Size" and .value=="L"))|.node.quantityAvailable' "$EVIDENCE/01-baseline.json")
UNIT_PRICE=$(jq -r '.data.product.variants.edges[]|select(.node.selectedOptions[]|select(.name=="Size" and .value=="L"))|.node.price.amount' "$EVIDENCE/01-baseline.json")
CURRENCY=$(jq -r '.data.product.variants.edges[]|select(.node.selectedOptions[]|select(.name=="Size" and .value=="L"))|.node.price.currencyCode' "$EVIDENCE/01-baseline.json")

echo "  variant L: $VARIANT_L_ID"
echo "  qty:       $QTY_BASELINE"
echo "  price:     $UNIT_PRICE $CURRENCY"

# ---------- 2. create fresh cart (1 unit) ----------
echo ""
echo "[2] Create fresh cart with 1x variant L"
sf 'mutation CreateCart($lines:[CartLineInput!]){
  cartCreate(input:{lines:$lines}){
    cart{
      id checkoutUrl totalQuantity
      cost{subtotalAmount{amount currencyCode} totalAmount{amount currencyCode}}
      discountCodes{code applicable}
      discountAllocations{__typename}
      lines(first:5){edges{node{id quantity
        cost{totalAmount{amount currencyCode}}
        merchandise{...on ProductVariant{
          id title
          selectedOptions{name value}
          image{url altText width height}
          product{handle title featuredImage{url}}
          price{amount currencyCode}
        }}
      }}}
    }
    userErrors{field message}
  }
}' "{\"lines\":[{\"merchandiseId\":\"$VARIANT_L_ID\",\"quantity\":1}]}" "$EVIDENCE/02-cart-create.json"

CART_ID=$(jq -r '.data.cartCreate.cart.id' "$EVIDENCE/02-cart-create.json")
CHECKOUT_URL=$(jq -r '.data.cartCreate.cart.checkoutUrl' "$EVIDENCE/02-cart-create.json")
CHECKOUT_HOST=$(echo "$CHECKOUT_URL" | awk -F/ '{print $3}')
SUBTOTAL=$(jq -r '.data.cartCreate.cart.cost.subtotalAmount.amount' "$EVIDENCE/02-cart-create.json")
TOTAL_QTY=$(jq -r '.data.cartCreate.cart.totalQuantity' "$EVIDENCE/02-cart-create.json")
LINE_COUNT=$(jq -r '.data.cartCreate.cart.lines.edges|length' "$EVIDENCE/02-cart-create.json")
DISCOUNTS=$(jq -c '.data.cartCreate.cart.discountCodes' "$EVIDENCE/02-cart-create.json")

echo "  cart id (last 10 chars only):    ...${CART_ID: -10}"
echo "  checkoutUrl host:                $CHECKOUT_HOST"
echo "  totalQuantity:                   $TOTAL_QTY"
echo "  subtotal:                        $SUBTOTAL $CURRENCY"
echo "  line count (dupe check):         $LINE_COUNT (expected 1)"
echo "  discount codes:                  $DISCOUNTS"

# ---------- 3. verify /cart on preview shows the correct handoff button ----------
echo ""
echo "[3] Fetch storefront /cart with the cart cookie (verifies frontend Checkout button URL)"
CART_ID_COOKIE=$(printf '%s' "$CART_ID" | jq -sRr @uri)  # url-encode for cookie
# The httpOnly attribute only affects browser-writes; the server still reads it.
curl -sL -b "onvor_cart_id=$CART_ID" -c /dev/null "$PREVIEW/cart" -o "$EVIDENCE/03-cart-page.html"
STOREFRONT_CHECKOUT_HREF=$(grep -oE '<a[^>]+href="[^"]*"[^>]*>[[:space:]]*Checkout' "$EVIDENCE/03-cart-page.html" | head -1 | grep -oE 'href="[^"]+"' | sed -E 's/href="//;s/"$//' || true)
echo "  frontend Checkout href host:     $(echo \"$STOREFRONT_CHECKOUT_HREF\" | awk -F/ '{print $3}')"
echo "  HTML has cart line count = $(grep -oE 'Stamp Tee' "$EVIDENCE/03-cart-page.html" | wc -l | tr -d ' ')"

# ---------- 4. inventory before checkout navigation ----------
echo ""
echo "[4] Inventory pre-checkout-navigation"
sf 'query GetProduct($handle: String!) {
  product(handle:$handle){variants(first:20){edges{node{selectedOptions{name value} quantityAvailable}}}}
}' '{"handle":"stamp-tee-black"}' "$EVIDENCE/04-inventory-pre-checkout.json"
QTY_PRE=$(jq -r '.data.product.variants.edges[]|select(.node.selectedOptions[]|select(.name=="Size" and .value=="L"))|.node.quantityAvailable' "$EVIDENCE/04-inventory-pre-checkout.json")
echo "  variant L qty: $QTY_PRE (baseline $QTY_BASELINE)"

# ---------- 5. navigate to checkout (headless Chrome, throwaway profile) ----------
echo ""
echo "[5] Headless Chrome navigates to checkoutUrl - fresh profile, no session"
"$CHROME" \
  --headless=new --no-sandbox --disable-gpu \
  --user-data-dir="$CHROME_PROFILE" \
  --window-size=1440,900 \
  --disable-features=BlockThirdPartyCookies \
  --virtual-time-budget=8000 \
  --enable-logging --v=1 \
  --dump-dom \
  "$CHECKOUT_URL" \
  > "$EVIDENCE/05-checkout-dom.html" \
  2> "$EVIDENCE/05-chrome-stderr.log" || true

DOM_BYTES=$(wc -c < "$EVIDENCE/05-checkout-dom.html")
echo "  DOM bytes: $DOM_BYTES"

# ---------- 6. inventory post-checkout-navigation ----------
echo ""
echo "[6] Inventory post-checkout-navigation"
sf 'query GetProduct($handle: String!) {
  product(handle:$handle){variants(first:20){edges{node{selectedOptions{name value} quantityAvailable}}}}
}' '{"handle":"stamp-tee-black"}' "$EVIDENCE/06-inventory-post-checkout.json"
QTY_POST=$(jq -r '.data.product.variants.edges[]|select(.node.selectedOptions[]|select(.name=="Size" and .value=="L"))|.node.quantityAvailable' "$EVIDENCE/06-inventory-post-checkout.json")
echo "  variant L qty: $QTY_POST (baseline $QTY_BASELINE)"

# ---------- 7. inspect checkout DOM for visible state ----------
echo ""
echo "[7] Inspect checkout DOM (grep-only, no interaction)"

# Shop/domain
DOM_TITLE=$(grep -oE '<title[^>]*>[^<]*</title>' "$EVIDENCE/05-checkout-dom.html" | head -1)
echo "  <title>: $DOM_TITLE"
DOM_ROOT_URL=$(grep -oE '"shopUrl":"https?://[^"]+"' "$EVIDENCE/05-checkout-dom.html" | head -1 || true)
echo "  shopUrl: $DOM_ROOT_URL"

# Product / variant present
STAMP_HITS=$(grep -oc 'Stamp Tee' "$EVIDENCE/05-checkout-dom.html" || echo 0)
BLACK_HITS=$(grep -oc -i 'black' "$EVIDENCE/05-checkout-dom.html" || echo 0)
SIZE_L_HITS=$(grep -oE '"size":"L"|>L<|Size.{0,20}L' "$EVIDENCE/05-checkout-dom.html" | wc -l | tr -d ' ')
QTY_HITS=$(grep -oE '"quantity":\s*1[^0-9]|quantity["'"'"']?\s*[:=]\s*["'"'"']?1' "$EVIDENCE/05-checkout-dom.html" | wc -l | tr -d ' ')
echo "  Stamp Tee occurrences:  $STAMP_HITS"
echo "  Size L markers:         $SIZE_L_HITS"
echo "  quantity=1 markers:     $QTY_HITS"

# Subtotal + currency
SUB_HIT=$(grep -oE 'Rs[[:space:]]*[.,]?[[:space:]]*1[[:space:]]*,?[[:space:]]*679' "$EVIDENCE/05-checkout-dom.html" | head -3)
echo "  Subtotal 1,679 hits: $(echo "$SUB_HIT" | wc -l | tr -d ' ')"

# Discount
DISCOUNT_HIT=$(grep -oE 'discount|Discount|reduction' "$EVIDENCE/05-checkout-dom.html" | wc -l | tr -d ' ')
echo "  Discount mentions (usually field labels + 'no discount applied'): $DISCOUNT_HIT"

# Return to cart / store branding
RETURN_HIT=$(grep -oE 'onvor|ONVOR|Onvor' "$EVIDENCE/05-checkout-dom.html" | wc -l | tr -d ' ')
echo "  Onvor branding hits: $RETURN_HIT"

# Payment/customer form presence (should exist but we do NOT interact)
EMAIL_INPUT=$(grep -oE 'name="checkout\[email\]"|id="checkout_email"|type="email"' "$EVIDENCE/05-checkout-dom.html" | head -3 | wc -l | tr -d ' ')
echo "  Email input hits (form present but not touched): $EMAIL_INPUT"

# ---------- 8. redact ----------
echo ""
echo "[8] Redacting evidence"
for f in "$EVIDENCE"/*.json "$EVIDENCE"/*.html "$EVIDENCE"/*.log; do
  redact "$f"
done
echo "  done"

# ---------- summary ----------
echo ""
echo "======================================================"
echo "Summary"
echo "======================================================"
echo "checkoutUrl host:       $CHECKOUT_HOST"
echo "storefront button host: $(echo \"$STOREFRONT_CHECKOUT_HREF\" | awk -F/ '{print $3}')"
echo "checkout DOM bytes:     $DOM_BYTES"
echo "cart line count:        $LINE_COUNT (expected 1 - dupe check)"
echo "discount state:         $DISCOUNTS"
echo "inv baseline / pre / post: $QTY_BASELINE / $QTY_PRE / $QTY_POST"
echo "Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
