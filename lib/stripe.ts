import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PRICE_AMOUNT = 14900 // $149 in cents
export const PRODUCT_NAME = 'Founder OS — Lifetime Access'