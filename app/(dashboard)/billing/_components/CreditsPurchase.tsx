"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { creditsPack, PackId, getCreditspack } from '@/types/billing'
import { useUser } from '@clerk/nextjs'
import { CoinsIcon, CreditCard, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

// Declare Razorpay type for window object (if not already globally declared)
declare global {
    interface Window {
        Razorpay: {
            new(options: Record<string, unknown>): {
                on: (event: string, callback: (response: RazorpayErrorResponse) => void) => void;
                open: () => void;
            };
        }
    }
}

// Add type for Razorpay error response
interface RazorpayErrorResponse {
    error: {
        code: string;
        description: string;
        reason: string;
        source: string;
        step: string;
        metadata: Record<string, unknown>;
    }
}

// Replace any with proper types
type OrderResponse = {
    id: string;
    amount: number;
    currency: string;
    orderId: string;
    [key: string]: unknown;
};

function CreditsPurchase() {
    const [selectedPackId, setSelectedPackId] = useState<PackId>(PackId.MEDIUM)
    const [isProcessing, setIsProcessing] = useState(false)
    const { user } = useUser() // Get user details for prefill

    const handlePurchase = async () => {
        if (!user) {
            toast.error("Please sign in to purchase credits.")
            return
        }
        if (!window.Razorpay) {
            toast.error("Payment gateway is not loaded. Please refresh the page.")
            console.error("Razorpay script not loaded")
            return
        }

        const pack = getCreditspack(selectedPackId)
        if (!pack) {
            toast.error("Selected credit pack not found.")
            return
        }

        setIsProcessing(true)
        toast.info("Processing your purchase...")

        try {
            // 1. Create Order on Backend
            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send amount in paisa (smallest currency unit)
                body: JSON.stringify({ amount: pack.price * 100, currency: 'INR' /*, creditPackId: pack.id */ }), // Consider sending pack.id in notes
            })

            const orderData = await response.json()

            if (!response.ok || !orderData.id) {
                console.error("Failed to create order:", orderData)
                toast.error(`Failed to create payment order: ${orderData.error || 'Unknown error'}`)
                setIsProcessing(false)
                return
            }

            // 2. Setup Razorpay Options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // From environment variables
                amount: orderData.amount, // Amount from order response (in paisa)
                currency: orderData.currency,
                name: "IntelliScrape Credits", // Your company name
                description: `Purchase ${pack.name}`,
                order_id: orderData.id, // From API response
                handler: function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
                    // Payment successful (Webhook handles credit grant)
                    console.log("Razorpay success response:", response)
                    toast.success("Payment Successful! Credits will be added shortly.")
                    // Optional: Verify payment signature on backend here for immediate feedback,
                    // but webhook is the source of truth for granting credits.
                    // e.g., call another API route `/api/payments/verify-signature`
                    // router.push('/billing?status=success') // Redirect on success
                    setIsProcessing(false)
                },
                prefill: {
                    name: user.fullName || "",
                    email: user.primaryEmailAddress?.emailAddress || "",
                    contact: user.primaryPhoneNumber?.phoneNumber || "", // Optional
                },
                notes: {
                    // address: "Your Corporate Office Address", // Optional
                    userId: user.id, // Pass userId for webhook processing
                    packId: pack.id, // Pass packId for webhook processing/logging
                },
                theme: {
                    color: "#3b82f6", // Match your theme (Tailwind blue-500)
                },
                modal: {
                    ondismiss: function() {
                        console.log('Razorpay checkout modal dismissed')
                        toast.info("Payment cancelled.")
                        setIsProcessing(false)
                    }
                }
            }

            // 3. Open Razorpay Checkout
            const rzp = new window.Razorpay(options)

            rzp.on('payment.failed', function (response: RazorpayErrorResponse) {
                console.error("Razorpay payment failed:", response.error)
                toast.error(`Payment Failed: ${response.error.description || response.error.reason}`)
                // Optionally log detailed error response.error
                setIsProcessing(false)
            })

            rzp.open()

        } catch (error) {
            console.error("Error during purchase process:", error)
            toast.error("An unexpected error occurred. Please try again.")
            setIsProcessing(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-2xl font-bold flex items-center gap-2'>
                    <CoinsIcon className='h-6 w-6 text-primary'/>
                    Purchase Credits
                </CardTitle>
                <CardDescription>
                    Select the number of credits you want to purchase
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Ensure creditsPack is defined or loaded */}
                <RadioGroup onValueChange={(value) => setSelectedPackId(value as PackId)} value={selectedPackId}>
                    {creditsPack?.map((pack) => (
                        <div key={pack.id} onClick={() => setSelectedPackId(pack.id)} className='flex items-center space-x-3 bg-secondary/50 rounded-lg p-3 hover:bg-secondary cursor-pointer'>
                            <RadioGroupItem value={pack.id} id={pack.id} />
                            <Label htmlFor={pack.id} className='flex justify-between w-full cursor-pointer'>
                                <span className='font-medium'>{pack.name} - {pack.label}</span>
                                <span className='font-bold text-primary'>
                                    ₹{(pack.price).toFixed(2)} {/* Display INR symbol */}
                                </span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter>
                <Button className='w-full' disabled={isProcessing} onClick={handlePurchase}>
                    {isProcessing ? (
                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    ) : (
                        <CreditCard className='mr-2 h-5 w-5' />
                    )}
                    Purchase credits
                </Button>
            </CardFooter>
        </Card>
    )
}

export default CreditsPurchase