import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICE_AMOUNT, PRODUCT_NAME } from '@/lib/stripe'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    let email: string | undefined
    try {
      const body = await req.json()
      email = body.email
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
      console.error('NEXT_PUBLIC_SITE_URL not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: PRICE_AMOUNT,
            product_data: {
              name: PRODUCT_NAME,
              description: 'Unlock $500K+ in startup credits with step-by-step instructions.',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success`,
      cancel_url: `${siteUrl}/credits`,
    })

    return NextResponse.json({ url: session.url }, {
      headers: {
        'Access-Control-Allow-Origin': siteUrl,
      }
    })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}