import { NextRequest, NextResponse } from "next/server"
import { getProvider } from "@/lib/provider"

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 })
  }

  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return NextResponse.json({ error: "text cannot be empty" }, { status: 400 })
  }
  if (trimmed.length > 500) {
    return NextResponse.json({ error: "text exceeds 500 characters" }, { status: 400 })
  }

  try {
    const provider = getProvider()
    const improved = await provider.improve(trimmed)
    return NextResponse.json({ improved })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
