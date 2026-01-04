import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 1. Get User's Organization (Owner/Admin only)
        const { data: member } = await supabase
            .from('organization_members')
            .select('organization_id, role, organizations(name, stripe_customer_id)')
            .eq('user_id', user.id)
            .single();

        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            return new NextResponse('Permission denied: Only Owners/Admins can upgrade', { status: 403 });
        }

        const org = member.organizations as any;
        const priceId = process.env.STRIPE_PRICE_ID;

        if (!priceId) {
            return new NextResponse('STRIPE_PRICE_ID is missing in env', { status: 500 });
        }

        // 2. Create or Retrieve Stripe Customer
        let customerId = org.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: org.name,
                metadata: {
                    organization_id: member.organization_id,
                },
            });
            customerId = customer.id;

            // Save customer ID to DB immediately
            await supabase
                .from('organizations')
                .update({ stripe_customer_id: customerId })
                .eq('id', member.organization_id);
        }

        // 3. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/settings?canceled=true`,
            metadata: {
                organization_id: member.organization_id,
            },
            subscription_data: {
                metadata: {
                    organization_id: member.organization_id,
                },
                trial_period_days: 7,
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
