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

        // 1. Get User's Organization
        const { data: member } = await supabase
            .from('organization_members')
            .select('organization_id, organizations(stripe_customer_id)')
            .eq('user_id', user.id)
            .single();

        if (!member || !member.organizations) {
            return new NextResponse('Organization not found', { status: 404 });
        }

        const org = member.organizations as any;

        if (!org.stripe_customer_id) {
            return new NextResponse('No billing account found', { status: 400 });
        }

        // 2. Create Portal Session
        // This allows the user to Manage/Cancel their subscription on Stripe's hosted page.
        const session = await stripe.billingPortal.sessions.create({
            customer: org.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/settings`,
        });

        return NextResponse.redirect(session.url, 303);
    } catch (err: any) {
        console.error('Stripe Portal Error:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
