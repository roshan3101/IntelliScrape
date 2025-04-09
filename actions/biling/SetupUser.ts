/**
 * Server action for setting up a new user's billing account
 * This action initializes a user's credit balance with a welcome bonus
 */

"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

/**
 * Sets up a new user by creating their initial credit balance
 * @throws Error if user is unauthenticated
 * @redirects to home page after setup
 */
export async function SetupUser() {
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId){
        throw new Error("unauthenticated")
    }

    // Check if user already has a balance record
    const balance = await prisma.userBalance.findUnique({
        where: {
            userId
        },
    });

    // Create initial balance with welcome credits if none exists
    if(!balance){
        await prisma.userBalance.create({
            data:{
                userId,
                credits: 100, // Welcome bonus credits
            }
        });
    }

    // Redirect to home page after setup
    redirect("/")
}