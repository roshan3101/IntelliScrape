/**
 * Root layout component for the Next.js application
 * This layout wraps all pages and provides global configuration
 * including authentication, fonts, and providers
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

// Initialize Geist Sans font for general text
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Initialize Geist Mono font for code/monospace text
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Application metadata for SEO and browser information
export const metadata: Metadata = {
  title: "IntelliScrape",
  description: "Developed by Roshan",
};

/**
 * Root layout component that wraps the entire application
 * @param children - React nodes to be rendered within the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Clerk authentication provider with custom configuration
    <ClerkProvider 
      afterSignOutUrl={"/sign-in"}
      appearance={{
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-sm shadow-none"
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            src="https://checkout.razorpay.com/v1/checkout.js"
            async
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Global application providers */}
          <AppProviders>{children}</AppProviders>
          
          {/* Toast notifications component */}
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
