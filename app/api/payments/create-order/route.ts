import { razorpay } from '@/lib/razorpay';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

// Define types for Razorpay order creation
interface RazorpayOrderCreateOptions {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
  payment_capture?: boolean;
  partial_payment?: boolean;
}

// Define the expected request body schema
const createOrderSchema = z.object({
  amount: z.number().min(100, { message: 'Amount must be at least 100 (representing 1 INR)' }), // Amount in smallest currency unit (e.g., paisa for INR)
  currency: z.string().default('INR'),
  creditPackId: z.string().optional(), // Credit pack ID if using predefined packs
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reqBody = await req.json();
    const validation = createOrderSchema.safeParse(reqBody);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const { amount, currency, creditPackId } = validation.data;

    // Create notes object with proper types (no undefined values)
    const notes: Record<string, string> = {
      userId: userId
    };
    
    // Only add creditPackId if it exists
    if (creditPackId) {
      notes.creditPackId = creditPackId;
    }

    // Create order options with proper types
    const options: RazorpayOrderCreateOptions = {
      amount: amount, // amount in the smallest currency unit
      currency: currency,
      receipt: `receipt_order_${new Date().getTime()}`,
      notes: notes
    };

    console.log("Creating Razorpay order with options:", options);

    const order = await razorpay.orders.create(options);

    console.log("Razorpay order created:", order);

    if (!order) {
       return NextResponse.json({ error: 'Razorpay order creation failed' }, { status: 500 });
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: 'Failed to create Razorpay order', details: errorMessage }, { status: 500 });
  }
} 