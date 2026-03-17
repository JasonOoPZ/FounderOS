# Product Architecture: Launch Perks

## Tech Stack
* Frontend: Next.js 14 (App Router), React, TypeScript
* Styling: Tailwind CSS, Shadcn UI
* Backend/Auth/DB: Supabase (PostgreSQL)
* Payments: Stripe Checkout (One-time $149 fee)

## Core Mechanics
1. **Free Tier (Directory):** Parse `_data/founders-kit.md` and display it as a searchable, filterable grid of resources. Excellent SEO.
2. **Dynamic Qualification Gate:** Before payment, users fill out a 3-question form (Stage, Tech Stack, Accelerator status). The UI calculates their "Eligible Credit Value" based on the `eligibility` array in `credits.json`.
3. **Paid Tier (Dashboard):** After paying a one-time $149 Stripe fee, `user.is_pro` becomes true in Supabase. They can now view the `locked_instructions` for all credits.

## Database Schema (Supabase)
* `users`: id, email, is_pro (boolean), startup_stage (string)
* `resources`: id, title, url, category (Parsed from founders-kit)
* `credits`: id, vendor, value, category, eligibility_array, public_desc, locked_instructions