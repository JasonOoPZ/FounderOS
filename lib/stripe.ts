import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not configured')
}

export const stripe = new Stripe(stripeSecretKey)

export const PRICE_AMOUNT = 14900 // $149 in cents
export const PRODUCT_NAME = 'Launch Perks — Lifetime Access'