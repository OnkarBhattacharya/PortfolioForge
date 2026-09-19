import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function findUserByCustomerId(supabase: any, customerId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  return data;
}

async function updateProfile(supabase: any, userId: string, data: Record<string, any>) {
  await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export async function POST(request: Request) {
  const supabase = await createServiceClient();
  
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unable to read webhook payload' },
      { status: 400 }
    );
  }
  
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { success: false, error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid Stripe signature' },
      { status: 400 }
    );
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof session.customer === 'string' ? session.customer : null;
        const userId = session.metadata?.userId || (customerId ? (await findUserByCustomerId(supabase, customerId))?.id : null);
        
        if (!userId) {
          console.warn('Checkout session completed but no user mapping found', {
            sessionId: session.id,
            customerId,
          });
          return NextResponse.json({ received: true });
        }
        
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
        const customerEmail = session.customer_details?.email ?? null;
        
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            stripe_customer_email: customerEmail,
            stripe_checkout_session_id: session.id,
            stripe_subscription_id: subscriptionId,
            checkout_completed_at: new Date().toISOString(),
            subscription_status: 'active',
          })
          .eq('id', userId);
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;
        
        if (!customerId) return NextResponse.json({ received: true });
        
        const user = await findUserByCustomerId(supabase, customerId);
        if (!user) {
          console.warn('Subscription event but no user found', {
            eventId: event.id,
            type: event.type,
            customerId,
          });
          return NextResponse.json({ received: true });
        }
        
        const priceId = subscription.items.data[0]?.price?.id ?? null;
        const priceNickname = subscription.items.data[0]?.price?.nickname ?? null;
        const currentPeriodEnd = subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString() 
          : null;
        
        const tier = priceNickname === 'Pro' ? 'pro' : priceNickname === 'Studio' ? 'studio' : 'free';
        
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            stripe_price_nickname: priceNickname,
            subscription_status: subscription.status,
            subscription_tier: tier,
            subscription_current_period_end: currentPeriodEnd,
            subscription_cancel_at_period_end: subscription.cancel_at_period_end,
            subscription_cancelled_at: subscription.canceled_at 
              ? new Date(subscription.canceled_at * 1000).toISOString() 
              : null,
          })
          .eq('id', user.id);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;
        
        if (!customerId) return NextResponse.json({ received: true });
        
        const user = await findUserByCustomerId(supabase, customerId);
        if (!user) return NextResponse.json({ received: true });
        
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            subscription_status: 'canceled',
            subscription_tier: 'free',
            subscription_cancelled_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;
        
        if (!customerId) return NextResponse.json({ received: true });
        
        const user = await findUserByCustomerId(supabase, customerId);
        if (!user) return NextResponse.json({ received: true });
        
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            latest_invoice_id: invoice.id,
            latest_invoice_status: 'paid',
            latest_invoice_amount_paid: invoice.amount_paid,
            latest_invoice_currency: invoice.currency,
            latest_invoice_at: new Date().toISOString(),
            subscription_status: 'active',
          })
          .eq('id', user.id);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;
        
        if (!customerId) return NextResponse.json({ received: true });
        
        const user = await findUserByCustomerId(supabase, customerId);
        if (!user) return NextResponse.json({ received: true });
        
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            latest_invoice_id: invoice.id,
            latest_invoice_status: 'failed',
            latest_invoice_amount_paid: invoice.amount_paid,
            latest_invoice_currency: invoice.currency,
            latest_invoice_at: new Date().toISOString(),
            subscription_status: 'past_due',
          })
          .eq('id', user.id);
        break;
      }
    }
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Stripe webhook processing failed:', {
      eventId: event.id,
      type: event.type,
      error,
    });
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function findUserByCustomerId(supabase: any, customerId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .limit(1)
    .single();
  return data;
}