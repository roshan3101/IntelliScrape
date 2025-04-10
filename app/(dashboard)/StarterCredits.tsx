'use client'

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * This component gives new users 100 starter credits
 * It runs once when the user logs in to the dashboard
 */
export default function StarterCredits() {
  const { user, isLoaded } = useUser();
  const [hasCheckedCredits, setHasCheckedCredits] = useState(false);

  useEffect(() => {
    // Wait until user data is loaded
    if (!isLoaded || !user || hasCheckedCredits) return;

    const checkAndAddStarterCredits = async () => {
      try {
        // First, check if user already has credits
        const balanceResponse = await fetch('/api/user/credits');
        const balanceData = await balanceResponse.json();

        // If user already has credits, don't add more
        if (balanceData.credits > 0) {
          console.log(`User ${user.id} already has ${balanceData.credits} credits. Skipping starter credits.`);
          setHasCheckedCredits(true);
          return;
        }

        // User doesn't have any credits, add 100 starter credits
        console.log(`New user detected: ${user.id}. Adding 100 starter credits.`);
        const response = await fetch('/api/user/credits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credits: 100,
            reason: 'New user starter credits'
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          console.log('Starter credits added successfully:', data);
          toast.success('Welcome to IntelliScrape!', {
            description: 'We\'ve added 100 starter credits to your account.',
            duration: 8000,
          });
        } else {
          console.error('Failed to add starter credits:', data);
        }
      } catch (error) {
        console.error('Error checking or adding starter credits:', error);
      } finally {
        setHasCheckedCredits(true);
      }
    };

    checkAndAddStarterCredits();
  }, [user, isLoaded, hasCheckedCredits]);

  // This component doesn't render anything
  return null;
} 