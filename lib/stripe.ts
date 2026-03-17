import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured')
  }

  stripeClient = new Stripe(stripeSecretKey)
  return stripeClient
}

export const PRICE_AMOUNT = 14900 // $149 in cents
export const PRODUCT_NAME = 'Launch Perks — Lifetime Access'