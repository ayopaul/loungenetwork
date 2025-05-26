import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const payload = await req.json()
  console.log('📦 Webhook payload received:', payload)

  return NextResponse.json({ success: true })
}