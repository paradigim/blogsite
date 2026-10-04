# MILKYARD — E-commerce Storefront & Admin (Angular UI)

A production-structured Angular 21 UI for **MILKYARD Dairy Products, Kolkata**: a premium public storefront, mobile-OTP customer accounts, Kolkata pincode-based delivery, checkout with a payment-gateway-ready layer, and a protected admin dashboard with sales, profit, inventory and traffic analytics.

> **This build is UI-only (no backend/database yet).** All data lives in an in-browser mock store (`localStorage`) so every screen is fully clickable. Each service is written so it can be swapped for real API calls without touching the components.

---

## Run it

```bash
npm install
npm start            # http://localhost:4200
npm run build        # production build → dist/milkyard/browser
```

Requires Node 20.19+ / 22.12+.

### Demo logins (mock OTP — no SMS is sent)

| Who | Mobile number | OTP |
|---|---|---|
| **Admin** | `7059080710` | `123456` |
| Customer | any other valid 10-digit number, e.g. `9876543210` | `123456` |

A new number goes through registration (name, email, alternate phone, then address). Logging in with the admin number shows an **ADMIN** button and opens `/admin`. Customers are redirected away from `/admin`.

Try these pincodes at checkout / in the pincode checker:
`700019` (Zone A, same day), `700029` (Zone B), `700091` (Salt Lake – Zone C), `700129` (Madhyamgram – "coming soon"), `110001` (not serviceable).

Coupons: `WELCOME10`, `GHEE100` (ghee ≥ ₹999), `PUJA15` (gift boxes).

**Admin → Settings → Reset demo data** restores the original catalogue and sample orders.

---

## What's included

**Storefront** — home (editable hero, category arches, tabbed best-sellers/new/featured, promo banners, process story, pincode checker, reviews, trust bar, WhatsApp CTA) · shop with filters & sort · category pages · site-wide search with live overlay · product page (gallery + zoom, size variants with unit price, buy now, pincode check, description/ingredients/nutrition/storage/legal tabs, frequently-bought-together, verified-purchase reviews, related products, mobile sticky add-to-cart) · quick view · cart drawer + cart page (variant change, coupons, free-delivery progress) · mobile bottom tab bar · floating WhatsApp button.

**Accounts** — browse and add to cart without logging in; mobile + OTP only when checking out · profile · multiple addresses (Home/Office/Other, default address, live serviceability check) · order history with status timeline, cancel, reorder · wishlist (guest wishlist merges on login) · cart persists per account.

**Checkout** — contact, saved/new address with Kolkata serviceability, zone delivery charge, minimum order, free-delivery threshold, coupons, UPI / card / net banking / wallet (COD wired but switched off), simulated Razorpay payment, confirmation page with order ID, items, address, charges, payment status and ETA.

**Admin (`/admin`)** — dashboard (today/week/month sales, orders, customers, est. profit, visitors, conversion, sales chart, best seller, devices, recent orders, orders by status, low stock) · orders (status tabs, Today/Yesterday/Week/Month/custom range, search, inline status change, CSV export) · order detail · products list & full editor (images upload/reorder, variants with price/MRP/cost/packaging/stock and live margin, food & legal info, SEO, flags, categories, bought-together) · categories (create/edit/hide/reorder) · inventory (inline stock edit, low/out-of-stock) · customers · sales analytics (daily/weekly/monthly/yearly, product & customer performance) · profit analytics (cost-based gross & net profit waterfall) · traffic (funnel, devices, sources, most-viewed) · coupons · delivery zones (pincode lists/ranges, charges, free-above, minimum, rider cost, tester) · homepage CMS · reviews moderation · notifications · settings.

**SEO** — per-page title/description/OG/canonical, Product, Organization, LocalBusiness and FAQ JSON-LD, `robots.txt`, `sitemap.xml`, clean URLs (`/product/pure-cow-ghee`, `/category/ghee`). For best indexing add Angular SSR/prerendering when deploying (`ng add @angular/ssr`).

---

## Project structure

```
src/app/
  core/
    models.ts                 # all domain types (Product, Order, DeliveryZone, Coupon…)
    data/catalog.ts           # seed products, categories, zones, coupons, homepage, settings
    data/demo.ts              # generated demo customers/orders/traffic for analytics
    services/                 # db (mock store), catalog, cart, auth, delivery, order,
                              # payment, notification, analytics, seo, wishlist, toast, ui
    guards/auth.guard.ts      # authGuard (checkout/account) + adminGuard
  layout/                     # header, footer, store layout (tab bar, WhatsApp)
  shared/                     # product card, quick view, cart drawer, search, pincode checker,
                              # address form, icons, INR pipe, status badge, order timeline
  pages/                      # storefront pages
  admin/                      # admin layout, pages, stats service, SVG charts
public/
  brand/                      # logo (from the MILKYARD brand files), favicon
  images/                     # illustrated placeholders for products/categories/hero
scripts/gen_art.py            # regenerates the placeholder illustrations
```

---

## Connecting the backend (next phase)

| Area | Where to plug in | Notes |
|---|---|---|
| Data | `DbService` → replace each signal with `HttpClient` calls | Postgres/MySQL tables mirror `models.ts` |
| OTP auth | `AuthService.sendOtp / verifyOtp` | MSG91, Twilio Verify or Firebase Phone Auth; issue an httpOnly session cookie |
| **Admin role** | server only | The admin number (`ADMIN_PHONE`) must live in server config. Every `/admin` API must check the role and return 403 — the Angular guard is only a convenience. |
| Payments | `PaymentService` / `RazorpayGateway` | Create order server-side, open Razorpay Checkout, verify signature + `payment.captured` webhook before marking Paid |
| Notifications | `NotificationService` | SMS (DLT templates), email, WhatsApp Business API |
| Analytics | `AnalyticsService` | Add GA4 `gtag.js` behind cookie consent; events already fire (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`) |
| Images | product editor upload | S3 / Cloudinary with WebP/AVIF resizing |

## Before launch — content to replace

- **Product photography**: the product images are custom illustrations used as placeholders. Replace them with real photos (square, ≥1200 px) in Admin → Products.
- **Prices, cost prices, stock, FSSAI licence number, GSTIN, business address, email** are placeholders.
- **Ratings, review counts, "sold" counts and all orders/customers are demo data.**
- **Policy pages and product claims** (e.g. "no added colour") are templates — have them verified and legally reviewed.
- Nutrition values are indicative; use your lab-tested label values.
