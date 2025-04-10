import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "@/lib/prisma";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Define types for Razorpay responses
interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    notes: {
        userId: string;
        packId: string;
        credits: string;
    };
}

interface RazorpayPayment {
    id: string;
    amount: number;
    currency: string;
    order_id: string;
}

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-razorpay-signature");

    if (!signature) {
        return new NextResponse("No signature", { status: 400 });
    }

    // Verify the webhook signature
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(body)
        .digest("hex");

    if (signature !== expectedSignature) {
        return new NextResponse("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle successful payment
    if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity as RazorpayPayment;
        const order = payment.order_id;

        try {
            // Get the order details
            const orderDetails = await razorpay.orders.fetch(order);
            const notes = orderDetails.notes as unknown as RazorpayOrder['notes'];
            
            if (!notes || !notes.userId || !notes.packId || !notes.credits) {
                throw new Error("Invalid order notes");
            }

            const { userId, packId, credits } = notes;

            // Update user's credits
            await prisma.userBalance.upsert({
                where: { userId },
                create: {
                    userId,
                    credits: parseInt(credits)
                },
                update: {
                    credits: {
                        increment: parseInt(credits)
                    }
                }
            });

            // Create a purchase record
            await prisma.userPurchase.create({
                data: {
                    userId,
                    purchaseId: payment.id,
                    description: `Purchased ${credits} credits`,
                    amount: payment.amount / 100, // Convert from paise to rupees
                    currency: payment.currency,
                    status: "completed"
                }
            });

            return new NextResponse("Success", { status: 200 });
        } catch (error) {
            console.error("Error processing payment:", error);
            return new NextResponse("Error processing payment", { status: 500 });
        }
    }

    return new NextResponse("Event not handled", { status: 200 });
} 