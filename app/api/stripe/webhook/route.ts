import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        return new NextResponse('Webhook secret or signature missing', { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutSessionCompleted(session);
                break;
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error: any) {
        console.error('Error processing webhook:', error);
        return new NextResponse('Webhook handler failed', { status: 500 });
    }

    return new NextResponse('Received', { status: 200 });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const orgId = session.metadata?.organization_id;
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    if (!orgId) {
        console.error('Organization ID missing in session metadata');
        return;
    }

    console.log(`Processing Checkout Success for Org: ${orgId}`);

    // Update Org with new Subscription ID and Status
    const { error } = await supabaseAdmin
        .from('organizations')
        .update({
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            subscription_status: 'active', // Assumes immediate payment success
            subscription_price_id: session.metadata?.price_id // or retrieve from line items if needed
        })
        .eq('id', orgId);

    if (error) {
        console.error('Failed to update organization after checkout:', error);
        throw error;
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const status = subscription.status;
    const priceId = subscription.items.data[0]?.price.id;

    console.log(`Processing Subscription Update for Customer ${customerId}: Status=${status}`);

    // Find the organization by Stripe Customer ID
    // Note: We need to query this efficiently. We added an index on stripe_customer_id earlier.
    const { data: orgs, error: fetchError } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .limit(1);

    if (fetchError || !orgs || orgs.length === 0) {
        console.error('Organization not found for Stripe Customer:', customerId);
        return;
    }

    const orgId = orgs[0].id;

    const { error } = await supabaseAdmin
        .from('organizations')
        .update({
            subscription_status: status,
            subscription_price_id: priceId,
            stripe_subscription_id: subscription.id
        })
        .eq('id', orgId);

    if (error) {
        console.error('Failed to update subscription status:', error);
        throw error;
    }
}
