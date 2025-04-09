/**
 * Server action for retrieving a user's available credit balance
 * This action fetches the current credit balance for the authenticated user
 */

"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"

/**
 * Retrieves the available credits for the authenticated user
 * @returns Number of available credits, or -1 if no balance record exists
 * @throws Error if user is unauthenticated
 */
export async function GetAvailableCredits() {
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId){
        throw new Error("unauthenticated")
    }

    // Fetch user's credit balance
    const balance = await prisma.userBalance.findUnique({
        where: { userId },
    });
    
    // Return -1 if no balance record exists
    if(!balance) return -1;
    
    return balance.credits;
}