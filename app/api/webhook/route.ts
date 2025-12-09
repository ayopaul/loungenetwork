import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

// Verify webhook signature to prevent unauthorized requests
function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;

  try {
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'utf-8');
    const expectedBuffer = Buffer.from(`sha256=${expectedSignature}`, 'utf-8');

    if (sigBuffer.length !== expectedBuffer.length) return false;

    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const webhookSecret = process.env.WEBHOOK_SECRET;

  // If webhook secret is configured, require signature verification
  if (webhookSecret) {
    const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-signature');
    const rawBody = await req.text();

    if (!verifySignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the verified body
    try {
      JSON.parse(rawBody); // Validate JSON format
      // Process webhook payload here as needed
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
  }

  // If no secret configured, reject all requests for security
  return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
}