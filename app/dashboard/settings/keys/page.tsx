
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Trash2, ShieldCheck } from 'lucide-react'
import { deleteApiKey } from './actions'
import ConnectKeysForm from './connect-keys-form'
import { Button } from '@/components/ui/button'

export default async function ApiKeysPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get current keys
    const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user!.id)
        .single()

    const { data: keys } = await supabase
        .from('api_keys')
        .select('provider, key_hint, is_active, updated_at')
        .eq('org_id', membership?.organization_id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-10 max-w-5xl pb-20">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">AI Keys</h2>
                <p className="text-zinc-500 mt-2 max-w-2xl text-lg">
                    Connect your preferred LLM provider. secure, encrypted, and private.
                </p>
            </div>

            {/* New Form */}
            <ConnectKeysForm />

            {/* Active Connections List */}
            {keys && keys.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Active Connections</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {keys.map((key) => (
                            <Card key={key.provider} className="group hover:border-zinc-300 transition-colors">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-zinc-100 rounded-lg flex items-center justify-center font-bold text-zinc-700 uppercase">
                                            {key.provider[0]}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base capitalize">{key.provider}</CardTitle>
                                            <CardDescription>
                                                Ends in ...{key.key_hint}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 pl-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Active
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <form action={async () => {
                                        'use server'
                                        await deleteApiKey(key.provider)
                                    }}>
                                        <Button variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Revoke Key
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Security Guarantee */}
            <div className="rounded-xl bg-zinc-50 p-6 border border-zinc-200 flex gap-4 items-start max-w-2xl">
                <div className="p-3 bg-white rounded-lg border shadow-sm text-blue-600">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                    <h4 className="font-semibold text-zinc-900">Zero-Training Guarantee</h4>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                        Velocibid uses your keys strictly for generating proposals within your secure workspace.
                        Your data is never used to train our models or shared with third parties.
                    </p>
                </div>
            </div>
        </div>
    )
}
