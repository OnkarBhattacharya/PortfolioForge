import Stripe from 'stripe';

let cachedStripe: Stripe | null = null;

function requireStripeSecretKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY before using Stripe helpers.');
  }

  return secretKey;
}

export function getStripe() {
  if (cachedStripe) {
    return cachedStripe;
  }

  cachedStripe = new Stripe(requireStripeSecretKey());
  return cachedStripe;
}

export const getStripeClient = getStripe;

export const stripe = new Proxy({} as Stripe, {
  get(_target, property, receiver) {
    const client = getStripe();
    const value = Reflect.get(client as object, property, receiver);

    if (typeof value === 'function') {
      return value.bind(client);
    }

    return value;
  },
}) as Stripe;

export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret is not configured. Set STRIPE_WEBHOOK_SECRET before handling webhooks.');
  }

  return webhookSecret;
}

export function getStripePriceId(plan: string): string {
  const normalizedPlan = plan.trim().toLowerCase();

  const priceMap: Record<string, string | undefined> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID || process.env.STRIPE_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ID,
    yearly: process.env.STRIPE_YEARLY_PRICE_ID,
    annual: process.env.STRIPE_ANNUAL_PRICE_ID || process.env.STRIPE_YEARLY_PRICE_ID,
  };

  const priceId = priceMap[normalizedPlan];
  if (!priceId) {
    throw new Error(`Stripe price ID is not configured for plan "${plan}".`);
  }

  return priceId;
}

export default stripe;