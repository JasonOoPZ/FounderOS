import { NextRequest, NextResponse } from "next/server";
import { providers, FREE_COUNT } from "@/lib/providers-data";

export async function GET(req: NextRequest) {
  try {
    const freeProviders = providers.slice(0, FREE_COUNT);
    const lockedProviders = providers.slice(FREE_COUNT).map(p => ({
      name: p.name,
      domain: p.domain,
      category: p.category,
      locked: true
    }));

    return NextResponse.json({
      free: freeProviders,
      locked: lockedProviders,
      isPro: false,
      total: providers.length
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}