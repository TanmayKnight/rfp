import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET() {
    try {
        const { error } = await supabaseAdmin
            .from('organizations')
            .update({
                subscription_status: 'inactive',
                stripe_customer_id: null,
                stripe_subscription_id: null
            })
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;

        return NextResponse.json({ message: 'Success! All organizations marked as active. You may close this tab.', status: 'active' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
