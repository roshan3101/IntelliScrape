import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Define schema for adding credits
const addCreditsSchema = z.object({
  credits: z.number().min(1, { message: 'Credits must be at least 1' }),
  reason: z.string().optional(),
});

/**
 * API endpoint to add credits directly to a user's account
 * This is intended for testing purposes or initial user setup
 */
export async function POST(req: NextRequest) {
  // Authenticate the request
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse and validate the request body
    const body = await req.json();
    const validation = addCreditsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }
    
    const { credits, reason = 'Direct credit addition' } = validation.data;
    
    console.log(`Adding ${credits} credits to user ${userId} directly. Reason: ${reason}`);
    
    // Check if user already has a balance
    const existingBalance = await prisma.userBalance.findUnique({
      where: { userId }
    });
    
    console.log(`Current user balance: ${existingBalance ? existingBalance.credits : 'No existing balance'}`);
    
    // Update the user's balance using upsert
    const updatedBalance = await prisma.userBalance.upsert({
      where: { userId },
      update: {
        credits: {
          increment: credits,
        },
      },
      create: {
        userId,
        credits,
      },
    });
    
    console.log(`Updated user balance: ${updatedBalance.credits} credits`);
    
    // Log the transaction
    await prisma.userPurchase.create({
      data: {
        userId,
        purchaseId: `direct-${Date.now()}`,
        description: reason,
        amount: 0, // No actual payment amount for direct additions
        currency: 'INR',
        status: 'completed',
      }
    });
    
    return NextResponse.json({
      success: true,
      credits: updatedBalance.credits,
      added: credits,
    });
    
  } catch (error) {
    console.error('Error adding credits:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: 'Failed to add credits', details: errorMessage }, { status: 500 });
  }
}

/**
 * API endpoint to get current user's credit balance
 */
export async function GET(req: NextRequest) {
  // Authenticate the request
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the user's current balance
    const balance = await prisma.userBalance.findUnique({
      where: { userId }
    });
    
    return NextResponse.json({
      credits: balance?.credits || 0,
    });
    
  } catch (error) {
    console.error('Error getting credits:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: 'Failed to get credits', details: errorMessage }, { status: 500 });
  }
} 