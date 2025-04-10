/**
 * Server action for purchasing credits through Razorpay
 * This action handles the creation of a Razorpay order
 * for credit pack purchases
 */

"use server"

import { getAppUrl } from "@/lib/helper/appUrl";
import { getCreditspack, PackId } from "@/types/billing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * Initiates a credit purchase through Razorpay
 * @param packId - The ID of the credit pack to purchase
 * @throws Error if user is unauthenticated, pack is invalid, or Razorpay order creation fails
 * @returns order details for client-side payment processing
 */
export async function PurchaseCredits(packId: PackId) {
    // Get the authenticated user's ID
    const {userId} = await auth();
    if(!userId){
        throw new Error("unauthenticated")
    }

    // Validate and get the selected credit pack
    const selectedPack = getCreditspack(packId);
    if(!selectedPack){
        throw new Error("invalid pack")
    }

    try {
        // Create a Razorpay order
        const order = await razorpay.orders.create({
            amount: selectedPack.price * 100, // Convert to paise (smallest currency unit)
            currency: "INR",
            receipt: `credits_${userId}_${Date.now()}`,
            notes: {
                userId,
                packId,
                credits: selectedPack.credits.toString()
            }
        });

        return {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            orderId: order.id
        };
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        throw new Error("Failed to create Razorpay order");
    }
}