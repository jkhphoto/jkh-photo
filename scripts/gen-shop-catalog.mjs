#!/usr/bin/env node
/**
 * Generate public/shop-catalog.json from the Decap shop content.
 *
 * This is the PRICE AUTHORITY for checkout. The browser sends only
 * {slug, variant index, qty}; the Cloudflare function reads this file
 * from the deployed site (env.ASSETS) and prices the order itself, so a
 * tampered request can change what's bought, never what it costs.
 *
 * Runs as part of `npm run build` — Cloudflare builds it fresh on every
 * deploy, so publishing a price change in Decap updates the authority
 * and the page together.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const shopDir = path.join(root, "content/shop");

function fm(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : "";
}
function val(block, key) {
  const m = block.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}
function variants(block) {
  // Line-walk instead of one clever regex: take every indented line after
  // "variants:" until the next top-level key, then split on "- ".
  const lines = block.split("\n");
  const start = lines.findIndex((l) => /^variants:\s*$/.test(l));
  if (start === -1) return [];
  const body = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\S/.test(lines[i])) break;
    body.push(lines[i]);
  }
  const out = [];
  for (const item of body.join("\n").split(/^\s*-\s/m).slice(1)) {
    const label = (item.match(/label:\s*(.*)/) || [])[1]?.trim().replace(/^["']|["']$/g, "");
    const price = Number((item.match(/price:\s*(.*)/) || [])[1]);
    const soldOut = /soldOut:\s*true/.test(item);
    if (label && Number.isFinite(price)) {
      out.push({ label, cents: Math.round(price * 100), soldOut });
    }
  }
  return out;
}

const products = {};
if (existsSync(shopDir)) {
  for (const f of readdirSync(shopDir).filter((f) => /\.mdx?$/.test(f))) {
    const block = fm(readFileSync(path.join(shopDir, f), "utf8"));
    const slug = f.replace(/\.mdx?$/, "");
    if (val(block, "active") === "false") continue;
    products[slug] = {
      title: val(block, "title") || slug,
      soldOut: val(block, "soldOut") === "true",
      // Where the product's page lives — lets that page host buy rows
      // for it (the catalog is the one map of what's sold where).
      link: val(block, "link") || "",
      variants: variants(block),
    };
  }
}

const settingsRaw = existsSync(path.join(root, "content/shop-settings.yml"))
  ? readFileSync(path.join(root, "content/shop-settings.yml"), "utf8")
  : "";
const shipping = {
  flatCents: Math.round(Number(val(settingsRaw, "shippingFlat") || 13) * 100),
  pickupEnabled: val(settingsRaw, "pickupEnabled") !== "false",
};

writeFileSync(
  path.join(root, "public/shop-catalog.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), products, shipping }, null, 2),
);
console.log(
  `shop-catalog: ${Object.keys(products).length} product(s), shipping $${(shipping.flatCents / 100).toFixed(2)}, pickup ${shipping.pickupEnabled}`,
);
