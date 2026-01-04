
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Copy, ExternalLink, Key, Loader2, ShieldCheck, ChevronRight, ArrowRight } from 'lucide-react'
import { saveApiKey } from './actions'
import { cn } from '@/lib/utils'

// Provider Registry
const PROVIDERS = [
    {
        id: 'openai',
        name: 'OpenAI',
        icon: 'O',
        url: 'https://platform.openai.com/api-keys',
        placeholder: 'sk-...',
        description: 'Powers GPT-4o and ensuring high-quality reasoning.',
        guideTitle: 'Get your OpenAI Key',
        guide: [
            'Log in to OpenAI Platform',
            'Click "Create new secret key"',
            'Name it "Velocibid" & copy',
        ]
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        icon: 'A',
        url: 'https://console.anthropic.com/settings/keys',
        placeholder: 'sk-ant-...',
        description: 'Home of Claude 3.5 Sonnet, excellent for long-context writing.',
        guideTitle: 'Get your Anthropic Key',
        guide: [
            'Go to Anthropic Console',
            'Select "Get API Keys"',
            'Create a Key & copy',
        ]
    },
    {
        id: 'gemini',
        name: 'Google Gemini',
        icon: 'G',
        url: 'https://aistudio.google.com/app/apikey',
        placeholder: 'AIza...',
        description: 'Google’s multimodal model with massive context window.',
        guideTitle: 'Get your Gemini Key',
        guide: [
            'Visit Google AI Studio',
            'Click "Get API key"',
            'Create key in new project',
        ]
    }
]

export default function ConnectKeysForm() {
    const [selectedProviderId, setSelectedProviderId] = useState<string>('')
    const [apiKey, setApiKey] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const provider = PROVIDERS.find(p => p.id === selectedProviderId)

    async function handleSubmit() {
        if (!provider || !apiKey) return
        setIsSubmitting(true)

        const formData = new FormData()
        formData.append('provider', provider.id)
        formData.append('apiKey', apiKey)
        await saveApiKey(formData)

        setApiKey('')
        setIsSubmitting(false)
        window.location.reload()
    }

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_300px] divide-y lg:divide-y-0 lg:divide-x divide-zinc-100">

                {/* Main Input Area */}
                <div className="p-8 space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">Connect AI Provider</h3>
                        <p className="text-sm text-zinc-500">Select a provider to enable autonomous proposal drafting.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Provider</label>
                            <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                                <SelectTrigger className="h-12 border-zinc-200 bg-white/80 focus:ring-zinc-200 transition-all hover:bg-zinc-50/50 text-base">
                                    <SelectValue placeholder="Select Provider..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROVIDERS.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="cursor-pointer py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-5 w-5 rounded bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                                                    {p.icon}
                                                </div>
                                                <span className="font-medium text-zinc-700">{p.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className={cn(
                            "space-y-2 transition-all duration-500 ease-in-out",
                            provider ? "opacity-100 translate-y-0" : "opacity-30 translate-y-4 pointer-events-none grayscale"
                        )}>
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">API Key</label>
                            <div className="relative group">
                                <Input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={provider?.placeholder || 'Select provider first...'}
                                    disabled={!provider}
                                    className="h-12 pl-11 font-mono text-sm border-zinc-200 bg-white/80 focus-visible:ring-zinc-900 focus-visible:ring-offset-0 transition-all"
                                />
                                <Key className="absolute left-3.5 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            className="w-full h-12 text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10 transition-all active:scale-[0.99]"
                            disabled={!provider || !apiKey || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Encrypting...
                                </>
                            ) : (
                                <>
                                    Connect {provider?.name || 'Provider'} <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                        <p className="text-center mt-3 text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                            <ShieldCheck className="h-3 w-3" />
                            Secure AES-256 Encryption
                        </p>
                    </div>
                </div>

                {/* Right Guide Panel (Dynamic) */}
                <div className="bg-zinc-50/50 p-8 flex flex-col">
                    {provider ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                                    <div className="h-6 w-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                        {provider.icon}
                                    </div>
                                    {provider.guideTitle}
                                </h4>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    {provider.description}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {provider.guide.map((step, i) => (
                                    <div key={i} className="flex gap-3 text-sm text-zinc-600">
                                        <div className="flex-shrink-0 h-5 w-5 rounded-full border border-zinc-200 bg-white text-zinc-500 flex items-center justify-center text-[10px] font-medium shadow-sm">
                                            {i + 1}
                                        </div>
                                        <p className="pt-px text-xs">{step}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 mt-auto">
                                <a
                                    href={provider.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group"
                                >
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-white shadow-sm group-hover:border-blue-300 group-hover:shadow-md transition-all">
                                        <span className="text-xs font-medium text-zinc-700">Get Key from Dashboard</span>
                                        <ExternalLink className="h-3 w-3 text-zinc-400 group-hover:text-blue-500" />
                                    </div>
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center">
                                <div className="h-6 w-6 rounded border-2 border-zinc-300 border-dashed" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-zinc-900">No Provider Selected</p>
                                <p className="text-xs text-zinc-500 max-w-[150px] mx-auto">
                                    Choose a provider on the left to see setup instructions.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
