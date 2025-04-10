import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
// import { env } from '@/lib/env'; // Assuming env validation
import { handlePaymentCaptured } from '@/lib/razorpay/HandlePaymentCaptured'; // We will create this next

// Get the webhook secret from environment variables
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
     console.error('Webhook secret is not configured.');
     return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  const body = await req.text(); // Read the raw body text

  if (!signature) {
    console.warn('Webhook request received without signature.');
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  try {
    // Verify the webhook signature
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(body);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      console.warn('Invalid webhook signature.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Signature is valid, parse the event payload
    const event = JSON.parse(body);

    console.log('Received Razorpay event:', event.event);

    // Handle specific events
    switch (event.event) {
      case 'payment.captured':
        const paymentEntity = event.payload.payment.entity;
        console.log('Handling payment.captured for payment ID:', paymentEntity.id);
        await handlePaymentCaptured(paymentEntity);
        break;
      case 'order.paid':
         console.log('Order paid event received:', event.payload.order.entity.id);
         break;
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Webhook processing failed';
    return NextResponse.json({ error: 'Webhook processing error', details: errorMessage }, { status: 500 });
  }
} 