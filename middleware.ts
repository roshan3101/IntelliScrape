/**
 * Middleware for handling authentication and route protection using Clerk
 * This middleware ensures that only authenticated users can access protected routes
 * while allowing public access to specified routes
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
// These include authentication pages and specific API endpoints
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',      // Sign-in page and related routes
  "/sign-up(.*)",      // Sign-up page and related routes
  "/api/workflows/(.*)*", // Workflow API endpoints
  "/api/webhooks/stripe"  // Stripe webhook endpoint
])

// Main middleware function that handles authentication
export default clerkMiddleware(async (auth, req) => {
  // Check if the current route is public
  // If not public, enforce authentication
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

// Configuration for the middleware
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};