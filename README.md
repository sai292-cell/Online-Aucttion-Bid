# 🔨 BidBazaar — Online Auction & Real-Time Bidding Marketplace

> **Academic College Submission Project — Complete End-to-End Frontend-Only Single Page Application**  
> Built with **Angular 17 Standalone Architecture**, **Signals**, **New Control Flow (`@if`, `@for`, `@switch`)**, **Lazy-Loaded Route Chunks**, **Functional Guards**, and **Simulated RxJS Real-Time Bidding Engine**.

---

## 🌟 Executive Summary

**BidBazaar** is a premier digital auction marketplace designed in the style of high-end auction houses (Sotheby's, Christie's, and Catawiki). It delivers a full-featured online bidding experience with **zero backend infrastructure**. All seed data is loaded via Angular's `HttpClient` from `src/assets/db.json` and dynamically mutated/persisted in the browser's `localStorage`.

Real-time auction mechanics are simulated using **RxJS interval and timer streams**:
- **Simulated Bot Bidding Engine**: 8 autonomous bidder bots continuously analyze active auctions and submit competitive counter-bids every 3 to 6 seconds.
- **Anti-Sniping Protection Shield**: Any bid submitted within the last 60 seconds automatically extends the auction countdown timer by an additional 120 seconds (2 minutes).
- **Proxy / Max Auto-Bidding**: Users can set their maximum ceiling, allowing BidBazaar to automatically place the minimum increment required to maintain leadership.
- **End-to-End Win & Checkout**: Complete checkout flow with shipping address verification, simulated wallet/card/UPI payment, generated Order ID, printable tax invoice receipt, fulfillment timeline (Paid → Shipped → Delivered), and verified seller review posting.

---

## 🚀 Quick Run Guide

### Prerequisites
- **Node.js**: v18.19.0+ or v20.x or v22.x
- **NPM**: v9.x or v10.x

### How to Run the Project
Open your terminal in the `auction-app` project directory and run:

```bash
# 1. Install dependencies
npm install

# 2. Start development server (opens automatically in default browser)
npm start
```

Alternatively, from the workspace root:
```bash
npm start
```
The app will be available at: **`http://localhost:4200`**

### Verifying Compilation (Zero Error Guarantee)
```bash
npm run build
```
*(Builds production bundles with zero TypeScript or Angular compiler errors).*

---

## 🔑 Demo Credentials (1-Click Fill on Login Page)

The login page includes **one-click demo credentials buttons** to log into any role instantly:

| Role | Email | Password | Pre-loaded Wallet Balance | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Buyer** | `buyer@bidbazaar.com` | `Password@123` | **₹1,75,000** | Bid, Proxy Bid, Buy Now, Watchlist, Checkout, Leave Reviews |
| **Seller** | `seller@bidbazaar.com` | `Password@123` | **₹2,85,000** | List new lots (5-step form), Edit listings, Delete unbid lots, Track seller revenue |
| **Admin** | `admin@bidbazaar.com` | `Password@123` | **₹5,00,000** | Platform moderation, Suspend/Unblock users, Delete any lot, Toggle featured lots |

*Note: New user self-registration is fully supported and grants an instant **₹50,000 bonus** to the user's wallet!*

---

## 📋 Comprehensive Feature Checklist

### 1. Home Page
- [x] **Hero Banner**: Engaging headline, trending keyword pills, search bar with category redirection.
- [x] **Live Metric Counters**: Real-time counts for Active Auctions, Total Bids Placed, Active Bidders, and Lot Volume.
- [x] **Closing Soon Carousel**: Displays lots in their final minutes with live ticking countdowns.
- [x] **Category Tiles**: 8 curated tiles with icons, descriptions, and active lot count badges.
- [x] **Featured Lots Grid**: High-value lots with instant bid links and watchlist hearts.
- [x] **Hot Right Now**: Lots ranked by bid count frequency.
- [x] **Platform Trust Pillars**: Explanations for simulated real-time bids, anti-sniping, proxy bidding, and escrow.

### 2. Browse & Search (Auctions)
- [x] **View Mode Toggle**: Switch seamlessly between Grid View and Compact List View.
- [x] **Multi-faceted Filtering**:
  - Full-text keyword search across titles and descriptions.
  - Category filter dropdown.
  - Price slider (₹10,000 to ₹20,00,000).
  - Condition checkboxes (Brand New, Like New, Refurbished, Vintage, Good).
  - Quick toggles: "Ending within 1 hour", "Has no bids yet (Bargain)", "Buy Now Available".
- [x] **Sorting**: Ending soonest, newly listed, price low-to-high, price high-to-low, most bids.
- [x] **Pagination**: Dynamic page calculation with previous/next controls and items range indicator.
- [x] **Empty State**: Friendly illustration and one-click "Reset All Filters" button.

### 3. Auction Detail Page
- [x] **Interactive Gallery**: Thumbnail selector with hover magnifying zoom on main image.
- [x] **Live Countdown Timer**: Real-time per-second clock that dynamically turns red and pulses under 5 minutes.
- [x] **Pricing & Status Display**: Current highest bid, bid count, minimum next increment, reserve met/not met badge.
- [x] **Bid Form**: Reactive form with balance validation and minimum increment enforcement.
- [x] **Quick-Bid Buttons**: One-click +1x, +2x, and +5x increment bidding.
- [x] **Proxy / Max Auto-Bidding**: Sets secret maximum ceiling; system outbids competitors incrementally.
- [x] **Buy Now Action**: Instant purchase option bypassing the countdown.
- [x] **Anti-Sniping Engine**: Bids submitted in the final 60 seconds automatically extend the timer by 2 minutes with toast notice.
- [x] **Bid History & Price Chart**: Interactive SVG polyline/area chart tracking price evolution over time, alongside a chronological activity table with leader badges.
- [x] **Q&A Section**: Prospective buyers can submit questions; answers display in conversational card layout.
- [x] **Seller Card**: Seller name, verification badge, star rating, and completed sales count.
- [x] **Similar Lots**: Category-matched recommendation grid.

### 4. Buyer Dashboard
- [x] **My Bids Tabs**:
  - *Winning*: Active lots where user holds highest bid.
  - *Outbid*: Active lots where user was outbid by a bot or competitor with quick counter-bid button.
  - *Won*: Finished lots won by user with direct checkout link.
  - *Lost*: Finished lots where user did not win.
- [x] **Watchlist**: Tracked lots with one-click unfavorite and live timer.
- [x] **Wallet & Ledger**: Total balance card, modal to simulate adding funds (+₹10K, +₹25K, +₹50K, +₹1L), and complete transaction history table.
- [x] **Notifications Center**: Outbid alerts, auction ending soon, winning notifications, wallet credits; mark as read / clear actions.

### 5. Win & Checkout Flow (End-to-End)
- [x] **Checkout Screen**: Shipping address form with validation (recipient name, address, city, state, 6-digit pincode, phone).
- [x] **Payment Methods**: Wallet escrow deduction, simulated credit/debit card, or mock UPI.
- [x] **Cost Breakdown**: Hammer price + ₹1,500 insured shipping + 3% GST & escrow fee.
- [x] **Order Confirmation & Printable Invoice**: Generated order ID (e.g. `ORD-849201`), tracking number, and clean printable tax invoice format for physical printing (`Ctrl+P` / `window.print()`).
- [x] **Order Tracking & Timeline**: Visual status timeline (`Paid` → `Shipped` → `Delivered`).
- [x] **Demo Advancement Shortcut**: Instant "Simulate Dispatch" and "Simulate Delivery" buttons so evaluators can advance fulfillment in 2 clicks.
- [x] **Verified Seller Review**: Interactive 5-star rating and written review submission after delivery.

### 6. Seller Section
- [x] **5-Step Consignment Wizard**:
  - *Step 1*: Title, category, condition, location, detailed description.
  - *Step 2*: 3 photo URLs with live image preview cards.
  - *Step 3*: Starting bid, increment, optional reserve price, optional Buy Now price.
  - *Step 4*: Duration selection (5 mins for flash testing, 30 mins, 3 hours, 24 hours).
  - *Step 5*: Review lot details and launch live auction.
- [x] **My Listings Management**:
  - Filter by Active, Sold, and Ended/Unsold.
  - Edit lot title, description, Buy Now price, and location.
  - Cancel/delete listing **strictly restricted to lots with zero bids**.
  - Metrics cards: Total Sales Realized, Active Lots, Sold Lots, Bids Attracted.

### 7. Admin Console (`role = admin`)
- [x] **Role Guard Protection**: Only accessible by authenticated admin users.
- [x] **Executive Metrics**: Total registered users, total catalog lots, bids processed, gross lot value turnover.
- [x] **Category Distribution**: Visual inventory bars across all 8 categories.
- [x] **Auction Moderation**: Toggle featured status, delete any lot.
- [x] **User Management**: Table showing all 12 users, their roles, wallet balances, and active/blocked statuses. One-click suspend/unblock toggle.

### 8. Extra Informational Pages
- [x] **About Page**: Platform mission, engineering highlights, and architecture pillars.
- [x] **How It Works**: 4-step workflow cards, anti-sniping explanation card, proxy bidding explanation.
- [x] **FAQ Accordion**: 8 interactive accordions answering all core operational questions.
- [x] **Contact Page**: Concierge desk details and reactive contact form with toast validation.
- [x] **404 Page**: Custom lot not found screen with direct navigation back to home and browse.

### 9. Design System & UX
- [x] **Light & Dark Mode**: Persistent theme toggle via CSS variables and `data-theme` attribute on document root.
- [x] **Responsive Mobile Support**: Mobile hamburger menu drawer, responsive grids, touch-friendly buttons.
- [x] **Sticky Navigation**: Brand logo, global search, categories, notifications bell with unread badge, wallet pill, and user avatar dropdown.
- [x] **Toast Notifications**: Reusable toast service for bids, wallet top-ups, errors, and success feedback.
- [x] **Typography & Icons**: Inter & Poppins via Google Fonts; Bootstrap Icons via CDN.

---

## 📂 Project Folder Structure

```
auction-app/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts           # Functional auth guard (login redirect)
│   │   │   │   └── role.guard.ts           # Admin and Seller route guards
│   │   │   ├── models/
│   │   │   │   ├── auction.model.ts        # Auction, Bid, Category, Question models
│   │   │   │   ├── user.model.ts           # User, AuthSession, UserRole models
│   │   │   │   ├── order.model.ts          # Order, OrderStatus, ShippingAddress, Review
│   │   │   │   ├── notification.model.ts   # Notification and notification types
│   │   │   │   └── wallet.model.ts         # Wallet transactions and ledger model
│   │   │   └── services/
│   │   │       ├── auction.service.ts      # Core signals, bot simulation, proxy & anti-sniping
│   │   │       ├── auth.service.ts         # User auth, JWT simulation, role checks
│   │   │       ├── wallet.service.ts       # Balance, credits, debits, transaction logging
│   │   │       ├── notification.service.ts # In-app notification signals and counters
│   │   │       ├── order.service.ts        # Order creation, invoice, reviews
│   │   │       └── theme.service.ts        # Light/dark mode persistent switcher
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── auction-card/           # Reusable auction card with hover zoom & timers
│   │   │   │   ├── countdown-timer/        # Real-time ticking countdown with urgency color
│   │   │   │   ├── bid-form/               # Interactive bid box, quick-bids, proxy, Buy Now
│   │   │   │   ├── navbar/                 # Sticky navbar, search, wallet pill, notifications
│   │   │   │   ├── footer/                 # Marketplace footer, links, newsletter
│   │   │   │   ├── toast/                  # Global animated notification toast
│   │   │   │   ├── modal/                  # Accessible dialog modal component
│   │   │   │   ├── star-rating/            # 5-star rating display & interactive picker
│   │   │   │   └── skeleton/               # Shimmer loading skeleton
│   │   │   └── pipes/
│   │   │       ├── time-left.pipe.ts       # Formats epoch milliseconds into D/H/M/S
│   │   │       ├── currency-inr.pipe.ts    # Formats numbers to Indian Rupee (₹1,50,000)
│   │   │       └── time-ago.pipe.ts        # Relative time (e.g. '2m ago', 'yesterday')
│   │   ├── features/
│   │   │   ├── home/                       # Hero banner, stats, ending soon, categories
│   │   │   ├── auctions/
│   │   │   │   ├── browse/                 # Filter sidebar, sort, grid/list view, pagination
│   │   │   │   └── detail/                 # Image zoom gallery, bid history, SVG chart, Q&A
│   │   │   ├── auth/
│   │   │   │   ├── login/                  # Login form with 1-click demo logins
│   │   │   │   └── register/               # Register form with password strength meter
│   │   │   ├── dashboard/                  # Winning/Outbid/Won/Lost tabs, watchlist, wallet
│   │   │   ├── seller/
│   │   │   │   ├── sell-item/              # 5-step consignment wizard
│   │   │   │   └── my-listings/            # Seller inventory, edit, cancel rules, sales stats
│   │   │   ├── admin/
│   │   │   │   └── admin-dashboard/        # Analytics, user moderation, lot controls
│   │   │   ├── checkout/
│   │   │   │   ├── checkout/               # Shipping address & payment options
│   │   │   │   ├── order-confirmation/     # Printable tax invoice
│   │   │   │   └── order-history/          # Timeline (Paid>Shipped>Delivered), review modal
│   │   │   └── extra/
│   │   │       ├── about/                  # About page
│   │   │       ├── how-it-works/           # How real-time bidding works
│   │   │       ├── faq/                    # Interactive FAQ accordion
│   │   │       ├── contact/                # Contact desk form
│   │   │       └── not-found/              # 404 error page
│   │   ├── app.component.ts                # Root layout wrapper
│   │   └── routes.ts                       # Lazy-loaded route table with functional guards
│   ├── assets/
│   │   └── db.json                         # Seed database: 30 auctions, 12 users, bots, orders
│   ├── index.html                          # Meta, Google Fonts, Bootstrap Icons CDN
│   ├── styles.css                          # Modern CSS variables design system
│   └── main.ts                             # Bootstrap application with router & HttpClient
├── angular.json                            # Angular CLI workspace configuration
├── package.json                            # Project dependencies and npm scripts
└── README.md                               # Project documentation and viva guide
```

---

## 🎬 5-Minute Evaluation Demo Script

Follow this step-by-step walkthrough to demonstrate every core feature to your examiner:

| Time | Step | Action | What to Explain to Examiner |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:45** | **1. Explore & Live Simulation** | Open `http://localhost:4200`. Observe the hero banner, live metric counters, and the "Closing Soon" lots. Open any lot (e.g. *Rolex Submariner* or *Leica M11*). | Point out the real-time bot simulation: counter-bids automatically appear in the bid history every 3-6 seconds with live leader updates and SVG price curve recalculation. |
| **0:45 - 1:30** | **2. Sign In via 1-Click Demo** | Click **Log In** in the top navbar. Click the **Buyer** button to autofill `buyer@bidbazaar.com` / `Password@123` and sign in. | Mention fake JWT session generation, `localStorage` persistence, and the wallet pill showing the user's available balance in the navbar. |
| **1:30 - 2:30** | **3. Place Bids & Anti-Sniping** | On the lot page, use the **+1x Quick Bid** button or enter a custom amount. Next, open the **Proxy / Auto-Bid** accordion and set a ceiling. | Demonstrate that if a bid is placed in the final 60 seconds, anti-sniping activates and extends the auction clock by 2 minutes. Notice the toast alert and notification bell update. |
| **2:30 - 3:30** | **4. Dashboard & Outbid Alerts** | Click your avatar in the navbar → **Buyer Dashboard**. Review the **My Bids** sub-tabs: *Winning*, *Outbid*, *Won*, *Lost*. | Explain how Angular Signals reactively categorize auctions based on the current user's bids versus the bot leader. Open the **Wallet & Ledger** tab to show live credits/debits. |
| **3:30 - 4:15** | **5. Win & End-to-End Checkout** | Go to a lot with Buy Now or an ended lot won by you. Click **Buy Now** or go to **Checkout**. Fill the shipping address form and select **BidBazaar Wallet**. Click **Confirm & Pay**. | Show how the wallet balance is securely debited with a reference transaction record, redirecting to the official **Tax Invoice** receipt with `Print Invoice` support. |
| **4:15 - 5:00** | **6. Order Fulfillment & Review** | Navigate to **My Orders** (`/checkout/orders`). View the timeline (*Paid → Shipped → Delivered*). Click **Simulate Dispatch**, then **Simulate Delivery**. Click **Leave Rating & Review**. | Demonstrate the complete customer lifecycle: order tracking, simulated parcel delivery, and star rating/review persisting back to the seller's public profile. |

---

## 🎓 10 Viva Voce Questions & Answers

### Q1: Why did you choose Angular 17 Standalone Components instead of traditional NgModules?
> **Answer**: Standalone components eliminate the boilerplate of `NgModule` declarations. Each component directly declares its necessary imports (`imports: [CommonModule, RouterLink, ReactiveFormsModule]`), enabling faster tree-shaking, smaller bundle footprints, and seamless lazy loading through `loadComponent: () => import(...)`.

### Q2: How does the application maintain real-time bidding without a WebSocket or backend server?
> **Answer**: Real-time simulation is orchestrated using RxJS streams and Angular reactive timing:
> 1. A 1-second `setInterval` updates the central `currentTime` signal, which recalculates countdown strings and triggers urgent badge alerts under 5 minutes.
> 2. A randomized 3-to-6 second timer invokes the bot bidding engine, which selects active auctions, calculates the minimum next increment, and appends bids from a pool of 8 bot identities.

### Q3: What are Angular Signals and how are they used in this project?
> **Answer**: Signals are Angular's reactive primitive providing synchronous, fine-grained change notification without relying on Zone.js dirty checking. In `AuctionService`, signals like `auctions = signal<Auction[]>([])` and `currentTime = signal<number>(Date.now())` drive derived state through `computed()` signals (e.g. `activeAuctions`, `endingSoonAuctions`, `totalVolume`), re-rendering only the components that depend on them.

### Q4: How is data persisted across page refreshes?
> **Answer**: On initial launch, the application checks `localStorage` for keys like `bb_auctions`, `bb_users`, `bb_session`, `bb_wallet_tx`, and `bb_orders`. If not found, `AuctionService` uses `HttpClient` to fetch `src/assets/db.json` and seeds `localStorage`. Every subsequent action (placing bids, creating listings, buying lots, adding funds) immediately mutates the in-memory signal and writes the updated array back to `localStorage`.

### Q5: How does the Anti-Sniping mechanism work technically?
> **Answer**: In `AuctionService.placeBid()`, before appending a new bid, the system computes `remainingSeconds = Math.floor((auction.endTime - Date.now()) / 1000)`. If `remainingSeconds <= 60`, the auction's `endTime` property is updated to `auction.endTime + 120,000` (extended by 2 minutes). An informational toast and in-app notification are triggered, preventing snipe scripts from winning lots unfairly.

### Q6: How does the Proxy / Auto-Bidding engine calculate counter-bids?
> **Answer**: When a user configures a maximum auto-bid ceiling, that ceiling is saved in the auction's `proxyMaxBids[username]` map. Whenever another bidder or bot places a bid, the bot engine verifies if any registered proxy ceiling exceeds the new bid by at least one increment. If so, a counter-bid is automatically injected on behalf of the user with `isAutoBid: true` at `newBid + increment`, keeping the user in the lead until their ceiling is breached.

### Q7: How are route guards implemented in Angular 17?
> **Answer**: Angular 17 utilizes functional route guards instead of class-based guards implementing `CanActivate`. We implemented `authGuard` using `inject(AuthService)` and `inject(Router)`. If `auth.isAuthenticated()` returns false, the guard redirects to `/auth/login?returnUrl=...`. Similarly, `adminGuard` and `sellerGuard` inspect the current session's user role to restrict administrative sections.

### Q8: What prevents a seller from canceling an auction once people have started bidding?
> **Answer**: In both the frontend UI and `AuctionService.deleteAuction()`, the system checks `if (auction.bids && auction.bids.length > 0)`. The delete button is disabled in the UI, and if invoked programmatically, the service rejects the request with an error toast: *"Cannot cancel listing: Bids have already been placed on this item"*. Only administrators possess override deletion privileges.

### Q9: How is the price-over-time chart on the detail page rendered without third-party chart libraries?
> **Answer**: The chart is built using native SVG elements (`<svg>`, `<polyline>`, `<polygon>`, and `<circle>`). `detail.component.ts` maps the auction's chronological bid amounts against a normalized coordinate box (600x180 px), calculating proportional `X` and `Y` coordinates dynamically. This ensures instantaneous rendering with zero dependencies.

### Q10: How does the application handle light and dark mode?
> **Answer**: `ThemeService` manages the active theme via a signal initialized from `localStorage.getItem('bb_theme')` or system media preference (`prefers-color-scheme`). An Angular `effect()` listens to theme changes and applies `document.documentElement.setAttribute('data-theme', mode)`. All styling utilizes CSS variables (`var(--bg-primary)`, `var(--text-primary)`, `var(--border-subtle)`), providing smooth, instantaneous transitions without reloading.

---

## 👨‍💻 Project Submission Details

- **Project Title**: BidBazaar — Online Auction & Real-Time Bidding Marketplace
- **Architecture**: Angular 17+ Standalone Components & Signals Single Page Application
- **Data Layer**: Mock Database (`assets/db.json`) + Persistent Browser `localStorage`
- **Execution Command**: `npm install && npm start`
- **Zero-Error Verified**: Tested and compiled with `ng build` (Application bundle generation complete)
