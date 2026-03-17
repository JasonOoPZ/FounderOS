import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not configured')
}
const stripe = new Stripe(stripeSecretKey);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase configuration incomplete')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not configured')
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("Missing stripe-signature header");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret as string);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email ?? session.customer_details?.email;

    if (!email || !isValidEmail(email)) {
      console.error("Invalid email from Stripe webhook:", email);
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase();

    const { error } = await supabase
      .from("users")
      .update({ is_pro: true })
      .eq("email", normalizedEmail);

    if (error) {
      console.error("Supabase update failed - not disclosed to client");
      // Don't expose internal error details
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    console.log("Pro access granted to:", normalizedEmail);
  }

  return NextResponse.json({ received: true });
}