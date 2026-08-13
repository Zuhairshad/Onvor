#!/usr/bin/env bash
# Phase C - restricted cart integration test.
# Storefront-API only. Uses stamp-tee-black size L (mid-inventory).
# All operations write only to the Cart resource - no inventory reservation,
# no checkout, no customer info, no order, no forms.
set -euo pipefail

cd "$(dirname "$0")/../../.."
source .env.local
DOMAIN=$(echo "$SHOPIFY_STORE_DOMAIN" | sed -E 's|^https?://||;s|/$||')
API_VER="${SHOPIFY_API_VERSION:-2026-07}"
TOKEN="$SHOPIFY_STOREFRONT_ACCESS_TOKEN"
ENDPOINT="https://${DOMAIN}/api/${API_VER}/graphql.json"

EVIDENCE_DIR="reports/evidence/phase-c"
mkdir -p "$EVIDENCE_DIR"

# ---- helpers ----
sf() {
  local query="$1" vars="${2:-{\}}" outfile="$3"
  curl -s -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Shopify-Storefront-Private-Token: $TOKEN" \
    -d "$(jq -cn --arg q "$query" --argjson v "$vars" '{query: $q, variables: $v}')" \
    -o "$outfile"
  echo "  wrote $outfile ($(wc -c <"$outfile") bytes)"
}

echo "======================================================"
echo "Phase C - restricted cart tests"
echo "Endpoint: $ENDPOINT"
echo "Started:  $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "======================================================"

# ---- Step 1: baseline product read (variants + inventory) ----
echo ""
echo "[1/9] Baseline: read stamp-tee-black variants + inventory"
sf 'query GetProduct($handle: String!) {
  product(handle: $handle) {
    id handle title availableForSale
    variants(first: 20) {
      edges {
        node {
          id title availableForSale quantityAvailable
          selectedOptions { name value }
          price { amount currencyCode }
        }
      }
    }
  }
}' '{"handle":"stamp-tee-black"}' "$EVIDENCE_DIR/01-baseline.json"

VARIANT_L_ID=$(jq -r '.data.product.variants.edges[] | select(.node.selectedOptions[] | select(.name=="Size" and .value=="L")) | .node.id' "$EVIDENCE_DIR/01-baseline.json")
VARIANT_L_QTY=$(jq -r '.data.product.variants.edges[] | select(.node.selectedOptions[] | select(.name=="Size" and .value=="L")) | .node.quantityAvailable' "$EVIDENCE_DIR/01-baseline.json")
UNIT_PRICE=$(jq -r '.data.product.variants.edges[] | select(.node.selectedOptions[] | select(.name=="Size" and .value=="L")) | .node.price.amount' "$EVIDENCE_DIR/01-baseline.json")
CURRENCY=$(jq -r '.data.product.variants.edges[] | select(.node.selectedOptions[] | select(.name=="Size" and .value=="L")) | .node.price.currencyCode' "$EVIDENCE_DIR/01-baseline.json")

echo "  variant L id:     $VARIANT_L_ID"
echo "  variant L qty:    $VARIANT_L_QTY (baseline)"
echo "  variant L price:  $UNIT_PRICE $CURRENCY"

# ---- Step 2: create cart with 1x variant L ----
echo ""
echo "[2/9] cartCreate with 1x size L"
sf 'mutation CreateCart($lines:[CartLineInput!]) {
  cartCreate(input:{lines:$lines}) {
    cart {
      id totalQuantity checkoutUrl
      cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
      lines(first:10) { edges { node { id quantity merchandise { ... on ProductVariant { id title } } } } }
    }
    userErrors { field message }
  }
}' "{\"lines\":[{\"merchandiseId\":\"$VARIANT_L_ID\",\"quantity\":1}]}" "$EVIDENCE_DIR/02-cart-create.json"

CART_ID=$(jq -r '.data.cartCreate.cart.id' "$EVIDENCE_DIR/02-cart-create.json")
CART_LINE_ID=$(jq -r '.data.cartCreate.cart.lines.edges[0].node.id' "$EVIDENCE_DIR/02-cart-create.json")
CART_SUBTOTAL=$(jq -r '.data.cartCreate.cart.cost.subtotalAmount.amount' "$EVIDENCE_DIR/02-cart-create.json")
CART_TOTAL_QTY=$(jq -r '.data.cartCreate.cart.totalQuantity' "$EVIDENCE_DIR/02-cart-create.json")

echo "  created cart id: $CART_ID"
echo "  line id:         $CART_LINE_ID"
echo "  totalQuantity:   $CART_TOTAL_QTY"
echo "  subtotal:        $CART_SUBTOTAL"
echo "  expected:        $UNIT_PRICE (1 x $UNIT_PRICE)"

# ---- Step 3: re-read inventory to confirm cart create did NOT reserve ----
echo ""
echo "[3/9] Re-read product inventory (must equal baseline)"
sf 'query GetProduct($handle: String!) {
  product(handle:$handle) {
    variants(first:20) { edges { node { selectedOptions { name value } quantityAvailable } } }
  }
}' '{"handle":"stamp-tee-black"}' "$EVIDENCE_DIR/03-inventory-after-create.json"

QTY_AFTER_CREATE=$(jq -r '.data.product.variants.edges[] | select(.node.selectedOptions[] | select(.name=="Size" and .value=="L")) | .node.quantityAvailable' "$EVIDENCE_DIR/03-inventory-after-create.json")
echo "  variant L qty:   $QTY_AFTER_CREATE (baseline was $VARIANT_L_QTY)"
if [ "$QTY_AFTER_CREATE" = "$VARIANT_L_QTY" ]; then
  echo "  RESULT: inventory unchanged - cart create did NOT reserve"
else
  echo "  RESULT: WARN inventory changed"
fi

# ---- Step 4: read cart back ----
echo ""
echo "[4/9] Read cart back via cart(id:)"
sf 'query GetCart($id:ID!) {
  cart(id:$id) {
    id totalQuantity
    cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
    lines(first:10) { edges { node { id quantity merchandise { ... on ProductVariant { id title } } } } }
  }
}' "{\"id\":\"$CART_ID\"}" "$EVIDENCE_DIR/04-cart-read.json"

echo "  totalQuantity:   $(jq -r '.data.cart.totalQuantity' "$EVIDENCE_DIR/04-cart-read.json")"
echo "  subtotal:        $(jq -r '.data.cart.cost.subtotalAmount.amount' "$EVIDENCE_DIR/04-cart-read.json")"

# ---- Step 5: update line to quantity 2 ----
echo ""
echo "[5/9] cartLinesUpdate: change quantity to 2"
sf 'mutation UpdateCart($cartId:ID!,$lines:[CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId:$cartId, lines:$lines) {
    cart {
      totalQuantity
      cost { subtotalAmount { amount currencyCode } }
      lines(first:10) { edges { node { id quantity } } }
    }
    userErrors { field message }
  }
}' "{\"cartId\":\"$CART_ID\",\"lines\":[{\"id\":\"$CART_LINE_ID\",\"quantity\":2}]}" "$EVIDENCE_DIR/05-cart-update-qty2.json"

QTY_AFTER_UPDATE=$(jq -r '.data.cartLinesUpdate.cart.totalQuantity' "$EVIDENCE_DIR/05-cart-update-qty2.json")
SUBTOTAL_AFTER_UPDATE=$(jq -r '.data.cartLinesUpdate.cart.cost.subtotalAmount.amount' "$EVIDENCE_DIR/05-cart-update-qty2.json")
EXPECTED_SUBTOTAL_2=$(awk "BEGIN{printf \"%.2f\", $UNIT_PRICE * 2}")
echo "  totalQuantity:   $QTY_AFTER_UPDATE (expected 2)"
echo "  subtotal:        $SUBTOTAL_AFTER_UPDATE (expected ~$EXPECTED_SUBTOTAL_2)"

# ---- Step 6: re-read inventory again ----
echo ""
echo "[6/9] Re-read inventory after qty update (must still equal baseline)"
sf 'query GetProduct($handle: String!) {
  product(handle:$handle) {
    variants(first:20) { edges { node { selectedOptions { name value } quantityAvailable } } }
  }
}' '{"handle":"stamp-tee-black"}' "$EVIDENCE_DIR/06-inventory-after-update.json"

QTY_AFTER_UPDATE_INV=$(jq -r '.data.product.variants.edges[] | select(.node.selectedOptions[] | select(.name=="Size" and .value=="L")) | .node.quantityAvailable' "$EVIDENCE_DIR/06-inventory-after-update.json")
echo "  variant L qty:   $QTY_AFTER_UPDATE_INV (baseline was $VARIANT_L_QTY)"

# ---- Step 7: remove line ----
echo ""
echo "[7/9] cartLinesRemove: remove the line"
sf 'mutation RemoveLine($cartId:ID!,$lineIds:[ID!]!) {
  cartLinesRemove(cartId:$cartId, lineIds:$lineIds) {
    cart { totalQuantity lines(first:10) { edges { node { id } } } }
    userErrors { field message }
  }
}' "{\"cartId\":\"$CART_ID\",\"lineIds\":[\"$CART_LINE_ID\"]}" "$EVIDENCE_DIR/07-cart-remove.json"

QTY_AFTER_REMOVE=$(jq -r '.data.cartLinesRemove.cart.totalQuantity' "$EVIDENCE_DIR/07-cart-remove.json")
LINES_AFTER_REMOVE=$(jq -r '.data.cartLinesRemove.cart.lines.edges | length' "$EVIDENCE_DIR/07-cart-remove.json")
echo "  totalQuantity:   $QTY_AFTER_REMOVE (expected 0)"
echo "  lines count:     $LINES_AFTER_REMOVE (expected 0)"

# ---- Step 8: final inventory check ----
echo ""
echo "[8/9] Final inventory check"
sf 'query GetProduct($handle: String!) {
  product(handle:$handle) {
    variants(first:20) { edges { node { selectedOptions { name value } quantityAvailable } } }
  }
}' '{"handle":"stamp-tee-black"}' "$EVIDENCE_DIR/08-inventory-final.json"

QTY_FINAL=$(jq -r '.data.product.variants.edges[] | select(.node.selectedOptions[] | select(.name=="Size" and .value=="L")) | .node.quantityAvailable' "$EVIDENCE_DIR/08-inventory-final.json")
echo "  variant L qty:   $QTY_FINAL (baseline was $VARIANT_L_QTY)"

# ---- Step 9: attempt invalid variant id add (negative path) ----
echo ""
echo "[9/9] Negative path: add invalid variant id"
sf 'mutation AddLine($cartId:ID!,$lines:[CartLineInput!]!) {
  cartLinesAdd(cartId:$cartId, lines:$lines) {
    cart { totalQuantity }
    userErrors { field message }
  }
}' "{\"cartId\":\"$CART_ID\",\"lines\":[{\"merchandiseId\":\"gid://shopify/ProductVariant/9999999999999\",\"quantity\":1}]}" "$EVIDENCE_DIR/09-cart-invalid-variant.json"

echo "  userErrors: $(jq -c '.data.cartLinesAdd.userErrors' "$EVIDENCE_DIR/09-cart-invalid-variant.json")"

# ---- summary ----
echo ""
echo "======================================================"
echo "Summary"
echo "======================================================"
echo "cart id:             $CART_ID"
echo "baseline qty (L):    $VARIANT_L_QTY"
echo "qty after create:    $QTY_AFTER_CREATE"
echo "qty after update:    $QTY_AFTER_UPDATE_INV"
echo "qty after remove:    $QTY_FINAL"
if [ "$VARIANT_L_QTY" = "$QTY_AFTER_CREATE" ] && [ "$VARIANT_L_QTY" = "$QTY_AFTER_UPDATE_INV" ] && [ "$VARIANT_L_QTY" = "$QTY_FINAL" ]; then
  echo "INVENTORY: UNCHANGED throughout - cart operations do NOT reserve inventory"
else
  echo "INVENTORY: CHANGED - WARN"
fi
echo "Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
