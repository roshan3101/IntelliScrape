"use server"

import { auth } from "@clerk/nextjs/server"
import prisma from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';

export async function DownloadInvoice(id: string) {
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

        // 3. Fetch invoice from Razorpay
        // Note: Razorpay's API might require the payment ID, not the purchase ID
        // Adjust based on your actual Razorpay API requirements
        const invoice = await razorpay.invoices.fetch(purchase.purchaseId);

        if (!invoice || !invoice.short_url) {
            throw new Error("Invoice not found or no download URL available");
        }

        // 4. Return the invoice URL
        return invoice.short_url;

    } catch (error) {
        console.error("Error fetching invoice:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to fetch invoice");
    }
}       