/**
 * POST /api/checkout — create a Stripe Checkout session for the cart.
 *
 * The browser sends only WHAT is being bought:
 *   { items: [{ slug, variant, qty }], fulfillment: "ship" | "pickup" }
 *
 * Prices come exclusively from /shop-catalog.json in THIS deployment
 * (env.ASSETS), generated at build time from the Decap content — a
 * tampered request can change the order, never the charge. Shipping is
 * restricted to the US at the Stripe level (allowed_countries), which is
 * the enforcement the old PayPal links never had: a non-US address can't
 * complete checkout at all. Pickup orders collect no address and no
 * shipping fee.
 *
 * Config: STRIPE_SECRET_KEY in the Cloudflare Pages environment (same
 * place as the Decap OAuth secrets). Until it's set, this returns 503
 * and the cart shows "checkout isn't live yet".
 */

const form = (obj) => {
  const p = new URLSearchParams();
  const walk = (prefix, v) => {
    if (Array.isArray(v)) v.forEach((x, i) => walk(`${prefix}[${i}]`, x));
    else if (v && typeof v === "object")
      Object.entries(v).forEach(([k, x]) => walk(prefix ? `${prefix}[${k}]` : k, x));
    else if (v !== undefined && v !== null) p.append(prefix, String(v));
  };
  walk("", obj);
  return p;
};

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export async function onRequestPost(context) {
  const { request, env } = context;

  const key = env.STRIPE_SECRET_KEY;
  if (!key) return json(503, { error: "checkout-not-configured" });

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "bad-json" });
  }
  const items = Array.isArray(body.items) ? body.items.slice(0, 20) : [];
  const fulfillment = body.fulfillment === "pickup" ? "pickup" : "ship";
  if (items.length === 0) return json(400, { error: "empty-cart" });

  // Price authority: the catalog baked into this very deployment.
  const catRes = await env.ASSETS.fetch(new URL("/shop-catalog.json", request.url));
  if (!catRes.ok) return json(500, { error: "catalog-unavailable" });
  const catalog = await catRes.json();

  const lineItems = [];
  for (const it of items) {
    const product = catalog.products?.[String(it.slug)];
    const variant = product?.variants?.[Number(it.variant)];
    const qty = Math.min(Math.max(Number(it.qty) || 1, 1), 10);
    if (!product || !variant) return json(400, { error: "unknown-item", slug: it.slug });
    if (product.soldOut || variant.soldOut) return json(409, { error: "sold-out", slug: it.slug });
    lineItems.push({
      quantity: qty,
      price_data: {
        currency: "usd",
        unit_amount: variant.cents,
        product_data: {
          name:
            product.variants.length > 1
              ? `${product.title} — ${variant.label}`
              : product.title,
        },
      },
    });
  }

  if (fulfillment === "pickup" && !catalog.shipping?.pickupEnabled) {
    return json(400, { error: "pickup-disabled" });
  }

  const origin = new URL(request.url).origin;
  const session = {
    mode: "payment",
    line_items: lineItems,
    success_url: `${origin}/shop/thanks`,
    cancel_url: `${origin}/shop`,
    ...(fulfillment === "ship"
      ? {
          shipping_address_collection: { allowed_countries: ["US"] },
          shipping_options: [
            {
              shipping_rate_data: {
                display_name: "US shipping",
                type: "fixed_amount",
                fixed_amount: { amount: catalog.shipping.flatCents, currency: "usd" },
              },
            },
          ],
        }
      : {
          // Pickup: no address, no shipping line. The confirmation email
          // from Stripe plus a custom note covers the handoff.
          custom_text: {
            submit: { message: "NYC pickup — reply to your receipt to arrange a time." },
          },
        }),
  };

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form(session),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("[checkout] stripe error", data?.error?.message);
    return json(502, { error: "stripe-error" });
  }
  return json(200, { url: data.url });
}
