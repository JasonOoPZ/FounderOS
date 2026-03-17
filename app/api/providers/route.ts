import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { providers, FREE_COUNT } from "../../../lib/providers-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""

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