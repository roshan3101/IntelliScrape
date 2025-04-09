/**
 * Server action for retrieving a user's purchase history
 * This action fetches all purchases made by the authenticated user
 */

"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * Retrieves the purchase history for the authenticated user
 * @returns Array of user purchases ordered by creation date
 * @throws Error if user is unauthenticated
 */
export async function GetUserPurchasesHistory() {
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId){
        throw new Error("unauthenticated")
    }

    // Fetch and return user's purchase history
    return prisma.userPurchase.findMany({
        where: { userId},
        orderBy: {
            createdAt: "desc"
        }
    })
}