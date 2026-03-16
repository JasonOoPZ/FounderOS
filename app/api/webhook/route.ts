import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email ?? session.customer_details?.email;

    if (!email) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    const { error } = await supabase
      .from("users")
      .update({ is_pro: true })
      .eq("email", email);

    if (error) {
      console.error("Supabase update failed:", error.message);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    console.log("Pro access granted to:", email);
  }

  return NextResponse.json({ received: true });
}