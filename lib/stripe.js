/**
 * lib/stripe.js
 * Stripe client setup for server-side usage
 */

import Stripe from "stripe";

// ─── Server-side Stripe instance ─────────────────────────────
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
  appInfo: {
    name: "Ultimate Spare Parts",
    version: "1.0.0",
  },
});

// ─── Helper: Format amount for Stripe (cents) ────────────────
export function toStripeAmount(amount) {
  return Math.round(amount * 100);
}

// ─── Helper: Format amount from Stripe (dollars) ─────────────
export function fromStripeAmount(amount) {
  return amount / 100;
}
