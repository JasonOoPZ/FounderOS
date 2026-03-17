import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('domain')
  const parsedSize = Number(searchParams.get('size') || '40')
  const size = Number.isFinite(parsedSize)
    ? Math.min(Math.max(Math.round(parsedSize), 16), 256)
    : 40

  if (!domain) {
    return NextResponse.json({ error: 'domain parameter required' }, { status: 400 })
  }

  // Validate domain format to prevent abuse
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
  }

  const logoToken = process.env.LOGO_API_TOKEN
  let normalizedDomain = domain
  
  // Handle special domain mappings
  const domainMap: Record<string, string> = {
    'cloud.google.com': 'google.com',
    'sanechoice.hk': 'sanechoice.hk',
  }
  normalizedDomain = domainMap[domain] || domain

  const urls: string[] = []
  if (logoToken) {
    urls.push(`https://img.logo.dev/${normalizedDomain}?token=${logoToken}&size=${size}`)
  }
  urls.push(`https://logo.clearbit.com/${normalizedDomain}`)
  urls.push(`https://www.google.com/s2/favicons?sz=${size}&domain_url=https://${normalizedDomain}`)
  urls.push(`https://icons.duckduckgo.com/ip3/${normalizedDomain}.ico`)

  for (const url of urls) {
    try {
      const upstream = await fetch(url, {
        headers: { Accept: 'image/*' },
        cache: 'force-cache',
      })

      const contentType = upstream.headers.get('content-type') || ''
      if (!upstream.ok || !contentType.startsWith('image/')) {
        continue
      }

      const body = await upstream.arrayBuffer()
      return new NextResponse(body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      })
    } catch {
      continue
    }
  }

  return NextResponse.json({ error: 'Logo not found' }, { status: 404 })
}
