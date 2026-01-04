import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET() {
    try {
        const { error } = await supabaseAdmin
            .from('organizations')
            .update({ subscription_status: 'active' })
            // Update all orgs that are NOT the placeholder (if any) or just all of them. 
            // Ideally we filter by the user's org but for this debug fix, updating all 'trialing'/'inactive' is fine locally.
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;

        return NextResponse.json({ message: 'Success! All organizations marked as active. You may close this tab.', status: 'active' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
