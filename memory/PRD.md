# MoodBite Product Requirements Document

## 1. Product Summary

**Product:** MoodBite — A Student-First AI Food Platform  
**Status:** Phase 1 MVP verified  
**Last updated:** 12 August 2026

MoodBite helps college students decide what to eat, order with friends, subscribe to daily home-style meals, and understand the sustainability impact of their food choices.

The product combines four connected experiences:

1. **AI Food Concierge** — recommends food or Tiffin plans from mood, cravings, dietary needs, budget, situation, and group size.
2. **Group Ordering with Smart Settlement** — one shared cart where the host pays once and tracks each friend's share.
3. **Daily Tiffin Marketplace** — discovery, comparison, and demo subscription flows for local home-style meal providers.
4. **Eco Mode** — reduced-packaging preferences, Eco Score, packaging avoided, and demo cause contributions.

## 2. Original Problem Statement

Build “MoodBite” as a premium, youthful, original student food platform that addresses:

- Decision fatigue around what to eat.
- Friction when friends build and settle a shared order.
- Difficulty finding reliable daily home-style meals.
- Low visibility into sustainable ordering choices.

The user requested a full-stack application with a FastAPI backend and real AI integration. The three highest-priority hero features are AI Concierge, Group Order + Settlement, and Daily Tiffin.

## 3. Target Users

### Primary Persona — College Student

- Lives in a hostel, PG, or shared flat.
- Has a constrained daily or monthly food budget.
- Frequently decides based on mood, study schedule, weather, and cravings.
- Orders individually and with friends.
- May need recurring home-style meals.
- Values convenience, transparency, and low-friction mobile use.

### Secondary Persona — Group Order Host

- Starts a shared order and invites friends.
- Needs a clear per-person breakdown.
- Pays the restaurant once.
- Tracks whether each friend has settled their share.

### Secondary Persona — Tiffin Subscriber

- Compares price, meal coverage, flexibility, delivery timing, and pause policy.
- Selects a weekly, monthly, or longer plan.
- Needs subscription details available from their profile.

## 4. Core Requirements

### 4.1 AI Food Concierge

- Accept free-form mood, budget, diet, craving, situation, and group-size prompts.
- Use a real LLM through the FastAPI backend.
- Ground all recommendations to MoodBite catalog IDs.
- Respect stated food budgets.
- Recommend Tiffin providers for recurring or home-style meal intent.
- Return one session ID and preserve it across a conversation.
- Show concise reasons for each recommendation.
- Allow food recommendations to open valid restaurant details and be added to cart.
- Allow Tiffin recommendations to open provider plans.
- Show loading and error states.

### 4.2 Group Ordering and Settlement

- Start a group and generate a share code/link.
- Provide a demo QR representation for joining.
- Simulate friends joining.
- Select which member an item is being added for.
- Maintain one shared cart with per-member sections and totals.
- Show subtotal, delivery fee, taxes, and host total.
- Use the host-pays-once model.
- Support settlement states: owed, sent, received/settled.
- Provide a clearly labeled demo payment QR.
- Continue into the common cart and checkout flow.

### 4.3 Daily Tiffin Marketplace

- Browse local Tiffin providers.
- Filter by meal coverage and vegetarian availability.
- Save providers.
- Compare up to four providers in a side-by-side matrix.
- Show weekly menus, delivery timing, area, and skip/pause policy.
- Compare plan durations, discounts, final price, and effective daily cost.
- Complete a demo subscription and display it in the profile.

### 4.4 Eco Mode

- Toggle reduced-packaging delivery from cart and checkout.
- Apply the visible demo Eco Mode discount.
- Increment estimated packaging avoided, Eco Score, and Eco orders after an Eco order.
- Show impact metrics in Eco Impact and Profile.
- Support clearly labeled demo contributions to sustainability causes.

### 4.5 Ordering and Discovery

- Browse restaurants and food items.
- Search with autocomplete across food, restaurants, and cuisine.
- Filter by cuisine, diet, budget, rating, popularity, and Eco availability.
- Add, remove, and change item quantities.
- Complete address, delivery preference, payment method, and confirmation steps.
- Support demo UPI, card, wallet, net banking, and COD interfaces.
- Track a newly created demo order through staged progress.
- Preserve cart, groups, subscriptions, orders, saved items, and Eco metrics in local storage.

## 5. Experience and Design Requirements

- Premium, youthful, food-first visual identity.
- Warm oat-milk background with Radish Pink and Matcha Green accents.
- Cabinet Grotesk headings and Satoshi body text.
- Mobile-first responsive layouts with no horizontal overflow.
- Desktop navigation and mobile bottom navigation.
- Generous spacing, clear hierarchy, and purposeful motion.
- Relevant food and student imagery rather than generic placeholders.
- Visible demo labels for all non-production financial or fulfillment interactions.
- Unique kebab-case `data-testid` hooks for interactive and critical state elements.

## 6. Technical Architecture

### Frontend

- React 19 application built with CRACO.
- React Router for 14+ product routes.
- Tailwind CSS and Shadcn/Radix UI primitives.
- Framer Motion for entrance and state transitions.
- Sonner for action feedback.
- Axios for backend requests.
- Context-based app state persisted to browser local storage.

### Backend

- FastAPI application with all public routes under `/api`.
- `GET /api/` for API health.
- `GET /api/catalog` for grounded food and Tiffin data.
- `POST /api/concierge` for real AI recommendations.
- `POST /api/status` and `GET /api/status` as MongoDB-backed status checks.
- MongoDB accessed only through `MONGO_URL` and `DB_NAME`.
- Concierge interaction logs stored in MongoDB when available.
- Pydantic response models used for Mongo-backed status responses.

### AI Integration

- Real text generation through the Emergent integration layer.
- Current configured model: OpenAI `gpt-5.4`.
- Grounding prompt contains the MoodBite catalog and requires exact catalog IDs.
- Session IDs are accepted and returned for multi-turn conversations.

### Data Model

- Food and Tiffin catalog data is application-managed catalog data.
- Cart, groups, subscriptions, orders, saved items, donation choice, and Eco state are prototype client state.
- Concierge logs and status checks use MongoDB.
- No authentication or user account database is included in Phase 1.

## 7. Routes

- `/` — Home and mood entry points.
- `/explore` — Search, autocomplete, and filters.
- `/restaurant/:id` — Restaurant menu and group-order entry.
- `/concierge` — AI Food Concierge.
- `/group` — Shared cart and settlement.
- `/cart` — Cart, Eco Mode, and donation choice.
- `/checkout` — Review, address, payment demo, and success.
- `/track/:id` — Order tracking.
- `/tiffin` — Tiffin marketplace.
- `/tiffin/compare` — Provider comparison.
- `/tiffin/:id` — Provider menu and subscription plans.
- `/eco` — Eco metrics and cause contributions.
- `/orders` — Current and past orders.
- `/profile` — Preferences, subscriptions, saved items, orders, group, and Eco summary.

## 8. Implemented and Verified — 12 August 2026

- Completed the full React route set and responsive navigation.
- Completed real AI Concierge backend and frontend session flow.
- Added grounded catalog recommendations with valid restaurant detail links.
- Completed group start, friend join, member item assignment, host total, and settlement state transitions.
- Completed Tiffin discovery, filters, comparison matrix, plan selection, and profile subscription.
- Completed cart controls, Eco Mode, demo contribution, checkout, order creation, and tracking.
- Completed Explore autocomplete and catalog filters.
- Added unique test hooks across critical interactions and user-facing states.
- Corrected Radix dialog descriptions and close-button test hooks.
- Confirmed production frontend build succeeds.
- Confirmed API root, catalog, status, budget recommendation, Tiffin intent, and multi-turn AI session behavior.
- Confirmed desktop and mobile core flows have no horizontal overflow.

## 9. Testing Record

### Automated

- Testing agent iteration: `/app/test_reports/iteration_1.json`.
- Backend pytest result: **7/7 passed**.
- JUnit report: `/app/test_reports/pytest/pytest_results.xml`.
- Backend success rate: **100%**.
- Frontend tested-scope success rate: **100%**.

### Manually Verified

- Frontend external preview returned HTTP 200.
- API root and catalog returned HTTP 200.
- Real AI Concierge returned budget-compliant recommendations with valid `restaurantId` fields.
- AI recommendation details navigation worked.
- Group settlement reached Settled.
- Tiffin comparison and subscription worked.
- Eco Mode changed the checkout total.
- COD demo checkout reached the success confirmation.
- Production build compiled successfully.

## 10. Demo and Mocked Boundaries

The following flows are intentionally **MOCKED DEMO FLOWS** in Phase 1:

- Restaurant order fulfillment.
- Payment processing and verification.
- UPI and QR transactions.
- Group settlement bank verification.
- Tiffin subscription billing.
- Donations.
- Delivery tracking updates.

The AI Concierge backend integration is real. Demo boundaries must remain clearly labeled in UI and documentation.

## 11. Prioritized Backlog

### P0 — Release Safety

- No open P0 defects in the tested MVP scope.
- Preserve visible demo labels until real providers replace mocked financial and fulfillment flows.
- Preserve unique `data-testid` coverage as new controls are added.

### P1 — Product Depth

- Move carts, groups, subscriptions, orders, saved items, and Eco metrics from local storage to MongoDB-backed APIs.
- Add schema-backed user profiles when authentication becomes a requirement.
- Add real invitation/join links for group members.
- Add provider availability, delivery zones, pause requests, and subscription management.
- Add order cancellation and support states.
- Add accessible tooltips and stronger keyboard focus coverage for icon-only controls.

### P2 — Future Enhancements

- Add richer search ranking, recent searches, and personalized autocomplete.
- Replace visual QR patterns with generated QR codes tied to real join or settlement links.
- Add group reminders and settlement notifications.
- Add recommendation history and one-tap reorder from AI conversations.
- Add Tiffin provider onboarding and provider dashboards.
- Add referral rewards for group orders and Tiffin subscriptions.
- Add analytics for Concierge conversion, group completion, Tiffin subscription conversion, and Eco Mode adoption.

## 12. Next Recommended Task

Build MongoDB-backed persistence for group orders and Tiffin subscriptions first. This preserves the strongest student workflows across devices and creates the foundation for future authentication, provider operations, and real payments.