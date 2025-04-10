import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
// import { env } from '@/lib/env'; // Assuming env validation
import { handlePaymentCaptured } from '@/lib/razorpay/HandlePaymentCaptured'; // We will create this next

// Get the webhook secret from environment variables
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// For testing purposes, if webhook secret is not set, use key secret (not recommended for production)
const secretForVerification = webhookSecret || keySecret;

export async function POST(req: NextRequest) {
  console.log(`==================== WEBHOOK REQUEST RECEIVED ====================`);
  
  if (!secretForVerification) {
    console.error('⚠️ CRITICAL: Webhook secret is not configured!');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  } else {
    console.log(`Using ${webhookSecret ? 'webhook secret' : 'key secret'} for webhook verification`);
  }

  const signature = req.headers.get('x-razorpay-signature');
  console.log(`Razorpay signature received: ${signature ? 'YES' : 'NO'}`);
  
  const body = await req.text(); // Read the raw body text
  console.log(`Webhook payload received, length: ${body.length} bytes`);
  console.log(`Webhook payload preview: ${body.substring(0, 200)}...`);

  if (!signature) {
    console.warn('⚠️ Webhook request received without signature!');
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  try {
    // Verify the webhook signature
    console.log(`Verifying webhook signature...`);
    const shasum = crypto.createHmac('sha256', secretForVerification);
    shasum.update(body);
    const digest = shasum.digest('hex');
    
    console.log(`Computed signature: ${digest}`);
    console.log(`Received signature: ${signature}`);
    console.log(`Signatures match: ${digest === signature ? 'YES ✅' : 'NO ❌'}`);

    if (digest !== signature) {
      console.warn('⚠️ Invalid webhook signature! This could be a security issue or misconfiguration.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Signature is valid, parse the event payload
    const event = JSON.parse(body);

    console.log(`Received Razorpay event type: ${event.event}`);
    console.log(`Event ID: ${event.id}`);
    console.log(`Event created at: ${new Date(event.created_at * 1000).toISOString()}`);

    // Handle specific events
    switch (event.event) {
      case 'payment.captured':
        const paymentEntity = event.payload.payment.entity;
        console.log(`🔶 Handling payment.captured for payment ID: ${paymentEntity.id}`);
        console.log(`Amount: ${paymentEntity.amount/100} ${paymentEntity.currency}`);
        console.log(`Payment notes:`, paymentEntity.notes);
        
        try {
          await handlePaymentCaptured(paymentEntity);
          console.log(`✅ Successfully processed payment.captured event!`);
        } catch (handlerError) {
          console.error(`❌ Error in payment capture handler:`, handlerError);
          // Still return 200 to Razorpay so they don't retry - we'll handle this internally
        }
        break;
        
      case 'order.paid':
        console.log(`🔶 Order paid event received: ${event.payload.order.entity.id}`);
        console.log(`Order details:`, event.payload.order.entity);
        break;
        
      default:
        console.log(`⚠️ Unhandled event type: ${event.event} - Acknowledge but no processing`);
    }

    console.log(`==================== WEBHOOK PROCESSING COMPLETED ====================`);
    return NextResponse.json({ received: true, status: 'success' });

  } catch (error) {
    console.error(`❌ Error processing Razorpay webhook:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Webhook processing failed';
    console.error(`Error details:`, error instanceof Error ? error.stack : String(error));
    console.log(`==================== WEBHOOK PROCESSING FAILED ====================`);
    return NextResponse.json({ error: 'Webhook processing error', details: errorMessage }, { status: 500 });
  }
} 