import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "@/lib/prisma";

// Initialize Razorpay with environment variables
let razorpay: Razorpay | undefined;

try {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });
} catch (error) {
    console.error("Error initializing Razorpay:", error);
    // We'll handle API calls safely below
}

// Define types for Razorpay responses
interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    notes: {
        userId: string;
        packId: string;
        credits: string;
    };
}

interface RazorpayPayment {
    entity: string;
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
}

export async function POST(req: Request) {
    try {
        // If Razorpay isn't initialized, return an error in non-production environments
        if (!razorpay && process.env.NODE_ENV !== "production") {
            return NextResponse.json(
                { error: "Razorpay not configured" },
                { status: 500 }
            );
        }

        const body = await req.text();
        const headersList = headers();
        const signature = headersList.get("x-razorpay-signature");

        // Verify webhook signature
        if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
            console.error("Missing signature or webhook secret");
            return NextResponse.json(
                { error: "Invalid request: missing signature" },
                { status: 400 }
            );
        }

        // Verify the webhook signature
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        const event = JSON.parse(body);
        const eventType = event.event;

        // Handle successful payment
        if (eventType === "payment.captured") {
            const payment = event.payload.payment.entity as RazorpayPayment;
            const orderId = payment.order_id;

            if (!razorpay) {
                return NextResponse.json(
                    { error: "Razorpay not configured" },
                    { status: 500 }
                );
            }

            const order = await razorpay.orders.fetch(orderId) as unknown as RazorpayOrder;
            
            if (!order?.notes?.userId || !order?.notes?.credits) {
                return NextResponse.json(
                    { error: "Invalid order data" },
                    { status: 400 }
                );
            }

            const userId = order.notes.userId;
            const credits = parseInt(order.notes.credits);

            // Update user's credits
            await prisma.userBalance.upsert({
                where: { userId },
                update: {
                    credits: {
                        increment: credits,
                    },
                },
                create: {
                    userId,
                    credits,
                },
            });

            // Create a purchase record
            await prisma.userPurchase.create({
                data: {
                    userId,
                    purchaseId: payment.id,
                    description: `Purchased ${credits} credits`,
                    amount: payment.amount / 100, // Convert from paisa to rupees
                    currency: payment.currency,
                    status: "completed"
                }
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 