import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js';

// Загружаем Stripe на стороне клиента
let stripePromise: Promise<StripeClient | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};
