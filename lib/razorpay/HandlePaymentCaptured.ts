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
    creditPackId?: string; // Add if you pass credit pack ID
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

// Credit pack definitions
interface CreditPack {
  id: string;
  amount: number; // in paisa
  credits: number;
  name: string;
}

// Define credit packs for easy lookup and management
const CREDIT_PACKS: CreditPack[] = [
  { id: 'basic', amount: 50000, credits: 500, name: 'Basic Pack' },
  { id: 'standard', amount: 100000, credits: 1200, name: 'Standard Pack' },
  { id: 'premium', amount: 200000, credits: 2500, name: 'Premium Pack' },
  { id: 'pro', amount: 500000, credits: 7000, name: 'Professional Pack' },
  { id: 'enterprise', amount: 1000000, credits: 15000, name: 'Enterprise Pack' },
];

// More flexible credit mapping function
const getCreditsForAmount = (amountPaisa: number, creditPackId?: string): number => {
  console.log(`Determining credits for amount: ${amountPaisa} paisa, creditPackId: ${creditPackId || 'not provided'}`);
  
  // If a specific credit pack ID is provided, use that first
  if (creditPackId) {
    const packById = CREDIT_PACKS.find(pack => pack.id === creditPackId);
    if (packById) {
      console.log(`Found credit pack by ID: ${packById.name}, credits: ${packById.credits}`);
      return packById.credits;
    } else {
      console.log(`No credit pack found for ID: ${creditPackId}, falling back to amount-based mapping`);
    }
  }
  
  // Otherwise, find by amount
  const packByAmount = CREDIT_PACKS.find(pack => pack.amount === amountPaisa);
  if (packByAmount) {
    console.log(`Found credit pack by amount: ${packByAmount.name}, credits: ${packByAmount.credits}`);
    return packByAmount.credits;
  } else {
    console.log(`No credit pack found for amount: ${amountPaisa}, using calculated credits`);
  }
  
  // Default fallback - 1 INR = 1 credit, but with a small bonus for larger amounts
  const amountInr = amountPaisa / 100;
  let creditsToGive = 0;
  
  // Add bonus credits for larger amounts
  if (amountInr >= 2000) {
    creditsToGive = Math.floor(amountInr * 1.3); // 30% bonus
    console.log(`Calculated credits with 30% bonus: ${creditsToGive}`);
  } else if (amountInr >= 1000) {
    creditsToGive = Math.floor(amountInr * 1.25); // 25% bonus
    console.log(`Calculated credits with 25% bonus: ${creditsToGive}`);
  } else if (amountInr >= 500) {
    creditsToGive = Math.floor(amountInr * 1.2); // 20% bonus
    console.log(`Calculated credits with 20% bonus: ${creditsToGive}`);
  } else if (amountInr >= 200) {
    creditsToGive = Math.floor(amountInr * 1.15); // 15% bonus
    console.log(`Calculated credits with 15% bonus: ${creditsToGive}`);
  } else if (amountInr >= 100) {
    creditsToGive = Math.floor(amountInr * 1.1); // 10% bonus
    console.log(`Calculated credits with 10% bonus: ${creditsToGive}`);
  } else {
    creditsToGive = Math.floor(amountInr);
    console.log(`Calculated credits with no bonus: ${creditsToGive}`);
  }
  
  return creditsToGive;
};
// --- End credit mapping logic ---


export async function handlePaymentCaptured(payment: RazorpayPaymentEntity): Promise<void> {
  console.log(`==================== PAYMENT CAPTURE PROCESSING ====================`);
  console.log(`Processing captured payment: ${payment.id}`);
  console.log(`Full payment object:`, JSON.stringify(payment, null, 2));

  // 1. Extract necessary info
  const userId = payment.notes?.userId;
  const creditPackId = payment.notes?.creditPackId;
  const amountPaid = payment.amount; // Already in smallest unit (paisa)
  const paymentId = payment.id;
  const orderId = payment.order_id;
  const status = payment.status; // Should be 'captured'

  console.log(`Payment details extracted:
    - userId: ${userId || 'NOT FOUND'}
    - creditPackId: ${creditPackId || 'NOT FOUND'}
    - amountPaid: ${amountPaid} paisa
    - paymentId: ${paymentId}
    - orderId: ${orderId}
    - status: ${status}
  `);

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
  console.log(`Calculating credits to add...`);
  const creditsToAdd = getCreditsForAmount(amountPaid, creditPackId);
  if (creditsToAdd <= 0) {
     console.warn(`No credits determined for amount ${amountPaid} for payment ${paymentId}. Skipping update.`);
     return;
  }

  console.log(`Attempting to add ${creditsToAdd} credits to user ${userId} for payment ${paymentId}`);

  try {
    // Check if user already has a balance
    const existingBalance = await prisma.userBalance.findUnique({
      where: { userId: userId }
    });
    
    console.log(`Current user balance check: ${existingBalance ? `Found: ${existingBalance.credits} credits` : 'No existing balance found'}`);

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

    console.log(`Successfully updated credits for user ${userId}. New balance: ${updatedBalance.credits} (added ${creditsToAdd} credits)`);

    // 4. Verify that the update was successful by checking the current balance
    const verifiedBalance = await prisma.userBalance.findUnique({
      where: { userId: userId }
    });
    
    console.log(`Verified user balance after update: ${verifiedBalance ? verifiedBalance.credits : 'ERROR: Balance not found'}`);

    // 5. Log payment success in UserPurchase table
    try {
      // Find the pack name if applicable
      let description = `Purchase of ${creditsToAdd} credits`;
      if (creditPackId) {
        const pack = CREDIT_PACKS.find(p => p.id === creditPackId);
        if (pack) {
          description = `Purchase of ${pack.name} (${creditsToAdd} credits)`;
        }
      }
      
      console.log(`Logging purchase with description: "${description}"`);
      
      const purchaseRecord = await prisma.userPurchase.create({
        data: {
          userId: userId,
          purchaseId: paymentId, // Using Razorpay Payment ID as the purchase ID
          description: description,
          amount: amountPaid, // Amount in smallest currency unit (paisa)
          currency: payment.currency,
          status: status, // Should be 'captured'
          // createdAt is handled by @default(now())
        }
      });
      console.log(`Successfully logged purchase ${paymentId} for user ${userId}. Purchase record:`, JSON.stringify(purchaseRecord, null, 2));
    } catch (logError) {
       console.error(`Failed to log purchase ${paymentId} for user ${userId} after updating balance:`, logError);
       // Don't throw an error here, as the credits were already granted.
       // Consider adding more robust logging or alerting for failed purchase logs.
    }

    console.log(`==================== PAYMENT PROCESSING COMPLETED SUCCESSFULLY ====================`);
  } catch (error) {
    // This catch block is for errors during the initial balance update (upsert)
    console.error(`Failed to update user balance for user ${userId} / payment ${paymentId}:`, error);
    console.error(`Error details:`, error instanceof Error ? error.stack : String(error));
    console.log(`==================== PAYMENT PROCESSING FAILED ====================`);
    // Implement retry logic or alert administrators if necessary for failed balance updates
  }
}
