"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { creditsPack, PackId, getCreditspack } from '@/types/billing'
import { useUser } from '@clerk/nextjs'
import { CoinsIcon, CreditCard, Loader2 } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

// Declare Razorpay type for window object (if not already globally declared)
declare global {
    interface Window {
        Razorpay: any; // Use 'any' or a more specific type if available
    }
}

// Environment detection for testing
const IS_TEST_ENV = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';

function CreditsPurchase() {
    const [selectedPackId, setSelectedPackId] = useState<PackId>(PackId.STANDARD)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isAddingCredits, setIsAddingCredits] = useState(false)
    const { user } = useUser() // Get user details for prefill

    // Function to directly add credits
    const addCreditsDirectly = async (packId: string, credits: number, reason: string = "Direct purchase") => {
        try {
            setIsAddingCredits(true);
            console.log(`Adding ${credits} credits for pack ${packId}. Reason: ${reason}`);
            
            const response = await fetch('/api/user/credits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credits,
                    reason
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add credits');
            }
            
            toast.success(`${credits} credits added to your account!`, {
                description: `Your new balance is ${data.credits} credits.`,
                duration: 5000,
            });
            
            console.log('Credits added successfully:', data);
            return true;
        } catch (error) {
            console.error('Error adding credits:', error);
            toast.error('Failed to add credits. Please try again.');
            return false;
        } finally {
            setIsAddingCredits(false);
        }
    };

    const handlePurchase = async () => {
        if (!user) {
            toast.error("Please sign in to purchase credits.")
            return
        }

        const pack = getCreditspack(selectedPackId)
        if (!pack) {
            toast.error("Selected credit pack not found.")
            return
        }

        setIsProcessing(true)
        toast.info(`Preparing your ${pack.name} purchase...`)
        console.log(`Initiating purchase for ${pack.name} (ID: ${pack.id}, Credits: ${pack.credits}, Price: ₹${pack.price})`)

        // Add credits immediately for every purchase (test or production)
        const creditSuccess = await addCreditsDirectly(
            pack.id, 
            pack.credits, 
            IS_TEST_ENV ? `Test purchase of ${pack.name}` : `Purchase of ${pack.name} (pending payment)`
        );

        // If credit addition failed or in test environment, finish here
        if (!creditSuccess || IS_TEST_ENV) {
            setIsProcessing(false);
            return;
        }

        // For production, continue with Razorpay flow
        if (!window.Razorpay) {
            toast.error("Payment gateway is not loaded. Please refresh the page.")
            console.error("Razorpay script not loaded")
            setIsProcessing(false)
            return
        }

        try {
            // 1. Create Order on Backend
            console.log(`Creating order with creditPackId: ${pack.id}`)
            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send amount in paisa (smallest currency unit)
                body: JSON.stringify({ 
                    amount: pack.price * 100, 
                    currency: 'INR',
                    creditPackId: pack.id // Send the credit pack ID to the server
                }),
            })

            const orderData = await response.json()
            console.log("Order created:", orderData)

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
                description: `Purchase ${pack.name} - ${pack.credits} credits`,
                order_id: orderData.id, // From API response
                handler: async function (response: any) {
                    // Payment successful
                    console.log("Razorpay success response:", response)
                    
                    toast.success(
                        `Payment completed successfully!`,
                        { duration: 6000 }
                    )
                    
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
                    creditPackId: pack.id, // Pass creditPackId for proper credit allocation
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

            // Log crucial checkout details for debugging
            console.log(`Checkout details:
                - Amount: ${options.amount/100} ${options.currency}
                - Order ID: ${options.order_id}
                - User ID: ${options.notes.userId}
                - Credit Pack: ${options.notes.creditPackId} (${pack.credits} credits)
            `)

            // 3. Open Razorpay Checkout
            const rzp = new window.Razorpay(options)

            rzp.on('payment.failed', function (response: any) {
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
                    Purchase Credits {IS_TEST_ENV && <span className="text-xs text-orange-500 ml-2">(Test Mode)</span>}
                </CardTitle>
                <CardDescription>
                    Select the number of credits you want to purchase
                    {IS_TEST_ENV && <div className="mt-1 text-orange-500">In test mode, credits are added immediately without payment</div>}
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
                <Button className='w-full' disabled={isProcessing || isAddingCredits} onClick={handlePurchase}>
                    {isProcessing || isAddingCredits ? (
                        <>
                            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                            {isAddingCredits ? 'Adding Credits...' : 'Processing Payment...'}
                        </>
                    ) : (
                        <>
                            <CreditCard className='mr-2 h-5 w-5' />
                            {IS_TEST_ENV ? 'Add Credits (Test Mode)' : 'Purchase Credits'}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default CreditsPurchase