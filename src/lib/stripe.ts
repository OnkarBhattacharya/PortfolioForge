import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  // This module can still be imported in dev, but routes should guard usage.
  // Avoid throwing at import time to keep tooling from breaking.
  // eslint-disable-next-line no-console
  console.warn('STRIPE_SECRET_KEY is not set. Stripe routes will not function.');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    })
  : null;
