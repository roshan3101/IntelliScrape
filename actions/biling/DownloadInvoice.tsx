/**
 * Server action for downloading a purchase invoice
 * This action retrieves the invoice URL from Razorpay for a specific purchase
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import prisma from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';

/**
 * Retrieves the download URL for a purchase invoice
 * @param id - The ID of the purchase to get the invoice for
 * @returns URL to download the invoice
 * @throws Error if user is unauthenticated, purchase not found, or invoice retrieval fails
 */
export async function DownloadInvoice(id: string) {
    // Get the authenticated user's ID
    const {userId} = await auth();
    if(!userId){
        throw new Error("unauthenticated")
    }

    try {
        // 1. Fetch purchase details from database
        const purchase = await prisma.userPurchase.findUnique({
            where: { id: id }
        });

        if (!purchase) {
            throw new Error("Purchase not found");
        }

        // 2. Verify the purchase belongs to the authenticated user
        if (purchase.userId !== userId) {
            throw new Error("unauthorized");
        }

        // 3. Fetch invoice from Razorpay's API
        const invoice = await razorpay.invoices.fetch(purchase.purchaseId);

        if (!invoice || !invoice.short_url) {
            throw new Error("Invoice not found or no download URL available");
        }

        // 4. Return the invoice download URL
        return invoice.short_url;

    } catch (error) {
        // Log and handle any errors that occur during the process
        console.error("Error fetching invoice:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to fetch invoice");
    }
}       