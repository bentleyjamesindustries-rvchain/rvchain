# Live marketplace setup

1. In Supabase → **SQL Editor**, run `supabase-marketplace.sql`.
2. Confirm Storage bucket **listing-images** exists and is **public**.
3. Auth → Providers → **Email** enabled (sign-up + password).
4. Set env (Vercel / `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://rv-chain.com
NEXT_PUBLIC_MODERATOR_EMAILS=your@email.com
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX
```

5. Make yourself admin (SQL), then grant Seller Pro from `/admin`:

```sql
update public.profiles set is_admin = true, seller_pro = true
where id = '<your-auth-user-uuid>';
```

6. Redeploy / restart the app.

**Limits:** free users = 1 active listing; Seller Pro = unlimited + Featured.
