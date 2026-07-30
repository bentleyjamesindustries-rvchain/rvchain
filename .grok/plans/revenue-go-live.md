# Revenue go-live (updated)

## Owner split

- **You:** Stripe account, products, keys, bank, tax basics
- **Site (done/live):** Free AI limit **1 message/day**; AI Pro & Seller Pro flags (admin until Stripe hooks up)
- **Later (code when you ask):** Wire Stripe Checkout → `profiles.ai_pro` / `seller_pro`

## Free hooks (conversion)

| Hook | Limit | Paid upgrade |
|------|--------|--------------|
| Trailhead AI | **1 message / day** | AI Pro ~$9.99/mo unlimited |
| Market listings | 3 active free | Seller Pro $12.99/mo unlimited + Featured |

## Your Stripe checklist

1. Create Stripe account under RV Chain LLC
2. Create products: Trailhead AI Pro monthly, Seller Pro monthly
3. Add to Vercel: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Tell us when keys are ready so Checkout + webhooks can be built

## Growth (ops)

- Keep Market stocked (10+ real listings)
- Share guides + Trailhead AI CTAs weekly
- Ads only after first real payments work

## Deployed code note

- Free AI limit set to **1** in `lib/trailheadAi.ts` (commit on main)
