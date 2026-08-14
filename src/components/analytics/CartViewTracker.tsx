"use client";

import { useEffect } from "react";
import { formatEcommerceItem, trackEvent } from "@/lib/analytics";
import type { Cart } from "@/lib/shopify/types";

export function CartViewTracker({ cart }: { cart: Cart | null }) {
  useEffect(() => {
    if (!cart || cart.lines.length === 0) return;

    const total = parseFloat(cart.cost.totalAmount.amount) || 0;
    const currency = cart.cost.totalAmount.currencyCode || "PKR";

    const items = cart.lines.map((line) =>
      formatEcommerceItem({
        id: line.merchandise.id,
        name: line.merchandise.product.title,
        price: line.cost.totalAmount.amount,
        quantity: line.quantity,
        variant: line.merchandise.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(" / "),
        currency,
      }),
    );

    trackEvent({
      event: "cart_viewed",
      value: total,
      currency,
      items,
    });
  }, [cart]);

  return null;
}
