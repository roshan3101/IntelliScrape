import prisma from '@/lib/prisma'; // Change to default import
import Razorpay from 'razorpay';

// Define a type for the expected payment entity structure (add more fields as needed)
type RazorpayPaymentEntity = {
  id: string;
  amount: number; // Amount in smallest currency unit (e.g., paisa)
  currency: string;
  status: string;
  order_id: string;
  invoice_id: string | null;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: {
    userId?: string; // Expecting userId passed in notes during order creation
    // creditPackId?: string; // Add if you pass credit pack ID
    [key: string]: any; // Allow other notes
  };
  fee: number | null;
  tax: number | null;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  acquirer_data: Record<string, any>;
  created_at: number; // Timestamp
};

// --- Define your credit mapping logic here ---
// Example: Map amount paid (in paisa) to credits awarded
// You might base this on creditPackId passed in notes instead
const getCreditsForAmount = (amountPaisa: number): number => {
  // Simple example: 1 INR = 1 credit (100 paisa = 1 credit)
  if (amountPaisa === 50000) return 500; // 500 INR -> 500 credits
  if (amountPaisa === 100000) return 1200; // 1000 INR -> 1200 credits (bonus!)
  if (amountPaisa === 200000) return 2500; // 2000 INR -> 2500 credits
  // Default fallback
  return Math.floor(amountPaisa / 100);
};
// --- End credit mapping logic ---


export async function handlePaymentCaptured(payment: RazorpayPaymentEntity): Promise<void> {
  console.log(`Processing captured payment: ${payment.id}`);

  // 1. Extract necessary info
  const userId = payment.notes?.userId;
  const amountPaid = payment.amount; // Already in smallest unit (paisa)
  const paymentId = payment.id;
  const orderId = payment.order_id;
  const status = payment.status; // Should be 'captured'

  if (status !== 'captured') {
    console.warn(`Payment ${paymentId} has status ${status}, not 'captured'. Skipping.`);
    return;
  }

  if (!userId) {
    console.error(`User ID not found in payment notes for payment ${paymentId}. Cannot grant credits.`);
    // Consider logging this payment attempt for manual review
    // await logFailedPayment(payment);
    return;
  }

  // 2. Determine credits purchased
  const creditsToAdd = getCreditsForAmount(amountPaid);
  if (creditsToAdd <= 0) {
     console.warn(`No credits determined for amount ${amountPaid} for payment ${paymentId}. Skipping update.`);
     return;
  }

  console.log(`Attempting to add ${creditsToAdd} credits to user ${userId} for payment ${paymentId}`);

  try {
    // 3. Update UserBalance using Prisma
    // Upsert ensures the user balance record exists or creates it
    const updatedBalance = await prisma.userBalance.upsert({
      where: { userId: userId },
      update: {
        credits: {
          increment: creditsToAdd,
        },
      },
      create: {
        userId: userId,
        credits: creditsToAdd,
      },
    });

    console.log(`Successfully updated credits for user ${userId}. New balance: ${updatedBalance.credits}`);

    // 4. Log payment success in UserPurchase table
    try {
      await prisma.userPurchase.create({
        data: {
          userId: userId,
          purchaseId: paymentId, // Using Razorpay Payment ID as the purchase ID
          description: `Purchase of ${creditsToAdd} credits`, // Example description
          amount: amountPaid, // Amount in smallest currency unit (paisa)
          currency: payment.currency,
          status: status, // Should be 'captured'
          // createdAt is handled by @default(now())
        }
      });
      console.log(`Successfully logged purchase ${paymentId} for user ${userId}`);
    } catch (logError) {
       console.error(`Failed to log purchase ${paymentId} for user ${userId} after updating balance:`, logError);
       // Don't throw an error here, as the credits were already granted.
       // Consider adding more robust logging or alerting for failed purchase logs.
    }

  } catch (error) {
    // This catch block is for errors during the initial balance update (upsert)
    console.error(`Failed to update user balance for user ${userId} / payment ${paymentId}:`, error);
    // Implement retry logic or alert administrators if necessary for failed balance updates
  }
}
