import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
  const supabase = await createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    );
  }
  
  const { priceId } = body as { priceId?: string };
  
  if (!priceId) {
    return NextResponse.json(
      { success: false, error: 'Price ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();
    
    let customerId = profile?.stripe_customer_id;
    
    if (!customerId && profile?.email) {
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }
    
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Could not create Stripe customer' },
        { status: 400 }
      );
    }
    
    // Payment methods offered at checkout. Configure via STRIPE_PAYMENT_METHODS
    // (comma-separated, e.g. "card" or "card,paypal"). Any method listed here
    // must also be enabled in Stripe Dashboard → Settings → Payment Methods,
    // otherwise session creation fails.
    const paymentMethodTypes = (process.env.STRIPE_PAYMENT_METHODS ?? 'card')
      .split(',')
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean) as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_types: paymentMethodTypes.length > 0 ? paymentMethodTypes : ['card'],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: { sessionId: session.id, url: session.url },
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}