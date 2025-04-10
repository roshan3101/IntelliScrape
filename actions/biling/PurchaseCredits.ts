/**
 * Server action for purchasing credits through Stripe
 * This action handles the creation of a Stripe checkout session
 * for credit pack purchases
 */

"use server"

import { getAppUrl } from "@/lib/helper/appUrl";
import { stripe } from "@/lib/stripe/stripe";
import { getCreditspack, PackId } from "@/types/billing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Initiates a credit purchase through Stripe checkout
 * @param packId - The ID of the credit pack to purchase
 * @throws Error if user is unauthenticated, pack is invalid, or Stripe session creation fails
 * @redirects to Stripe checkout page on success
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

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
        mode:"payment",
        invoice_creation: {
            enabled: true
        },
        success_url: getAppUrl("billing"),
        cancel_url: getAppUrl("billing"),
        metadata: {
            userId,
            packId
        },
        line_items: [
            {
                quantity: 1,
                price: selectedPack.priceId,
            }
        ]
    });

    if(!session.url){
        throw new Error("cannot create stripe session")
    }
    
    // Redirect to Stripe checkout page
    redirect(session.url);
}