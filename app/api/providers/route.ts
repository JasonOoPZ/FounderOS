import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { providers, FREE_COUNT } from "../../../lib/providers-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""

function parseSavingsValue(value?: string): number {
  if (!value || !/[\$€£]/.test(value)) return 0
  const normalized = value.replace(/,/g, "")
  const numberMatch = normalized.match(/\d+(?:\.\d+)?/)
  if (!numberMatch) return 0

  let amount = Number(numberMatch[0])
  if (/\b(billion|b)\b/i.test(normalized)) amount *= 1_000_000_000
  else if (/\b(million|m)\b/i.test(normalized)) amount *= 1_000_000
  else if (/\bk\b/i.test(normalized)) amount *= 1_000
  return amount
}

function formatSavingsLabel(total: number): string {
  if (total >= 1_000_000_000) return `$${(total / 1_000_000_000).toFixed(1)}B+`
  if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(1)}M+`
  if (total >= 1_000) return `$${Math.round(total / 1_000)}K+`
  return `$${Math.round(total)}+`
}

const totalPotentialSavings = providers.reduce((sum, provider) => {
  return sum + parseSavingsValue(provider.value)
}, 0)
const totalPotentialSavingsLabel = formatSavingsLabel(totalPotentialSavings)

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

    let isPro = false

    if (token && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const authClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      )

      const { data: userData } = await authClient.auth.getUser()
      const user = userData.user

      if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const { data: proData } = await adminClient
          .from("users")
          .select("is_pro")
          .eq("id", user.id)
          .single()

        isPro = proData?.is_pro === true
      }
    }

    if (isPro) {
      return NextResponse.json(
        {
          free: providers,
          locked: [],
          isPro: true,
          total: providers.length,
          totalPotentialSavings,
          totalPotentialSavingsLabel,
        },
        siteUrl
          ? {
              headers: {
                "Access-Control-Allow-Origin": siteUrl,
              },
            }
          : undefined
      )
    }

    const freeProviders = providers.slice(0, FREE_COUNT);
    const lockedProviders = providers.slice(FREE_COUNT).map(p => ({
      name: p.name,
      domain: p.domain,
      category: p.category,
      locked: true
    }));

    return NextResponse.json(
      {
        free: freeProviders,
        locked: lockedProviders,
        isPro: false,
        total: providers.length,
        totalPotentialSavings,
        totalPotentialSavingsLabel,
      },
      siteUrl
        ? {
            headers: {
              "Access-Control-Allow-Origin": siteUrl,
            },
          }
        : undefined
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}