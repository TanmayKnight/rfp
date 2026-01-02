'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signupAction(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    // Use the SITE_URL env var or default to localhost
    // This is crucial for the email verification link to redirect back correctly
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: fullName,
            }
        },
    })

    if (error) {
        console.error('Signup error:', error)
        return redirect('/signup?error=Could not create user')
    }

    // Redirect to a verification instruction page
    redirect('/verify-email')
}
