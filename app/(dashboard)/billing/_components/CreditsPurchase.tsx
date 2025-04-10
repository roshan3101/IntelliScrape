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
import { PurchaseCredits } from '@/actions/biling/PurchaseCredits'

// Declare Razorpay type for window object
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

function CreditsPurchase() {
    const [selectedPackId, setSelectedPackId] = useState<PackId>(PackId.MEDIUM)
    const [isProcessing, setIsProcessing] = useState(false)
    const { user } = useUser()

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
            // Create order on backend
            const orderData = await PurchaseCredits(selectedPackId)

            // Setup Razorpay Options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "IntelliScrape Credits",
                description: `Purchase ${pack.name}`,
                order_id: orderData.orderId,
                handler: function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
                    // Payment successful (Webhook handles credit grant)
                    console.log("Razorpay success response:", response)
                    toast.success("Payment Successful! Credits will be added shortly.")
                    setIsProcessing(false)
                },
                prefill: {
                    name: user.fullName || "",
                    email: user.primaryEmailAddress?.emailAddress || "",
                    contact: user.primaryPhoneNumber?.phoneNumber || "",
                },
                theme: {
                    color: "#3b82f6",
                },
                modal: {
                    ondismiss: function() {
                        console.log('Razorpay checkout modal dismissed')
                        toast.info("Payment cancelled.")
                        setIsProcessing(false)
                    }
                }
            }

            // Open Razorpay Checkout
            const rzp = new window.Razorpay(options)

            rzp.on('payment.failed', function (response: RazorpayErrorResponse) {
                console.error("Razorpay payment failed:", response.error)
                toast.error(`Payment Failed: ${response.error.description || response.error.reason}`)
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
                <RadioGroup onValueChange={(value) => setSelectedPackId(value as PackId)} value={selectedPackId}>
                    {creditsPack?.map((pack) => (
                        <div key={pack.id} onClick={() => setSelectedPackId(pack.id)} className='flex items-center space-x-3 bg-secondary/50 rounded-lg p-3 hover:bg-secondary cursor-pointer'>
                            <RadioGroupItem value={pack.id} id={pack.id} />
                            <Label htmlFor={pack.id} className='flex justify-between w-full cursor-pointer'>
                                <span className='font-medium'>{pack.name} - {pack.label}</span>
                                <span className='font-bold text-primary'>
                                    ₹{(pack.price).toFixed(2)}
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