
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createOrganizationAction } from './actions'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user already has an organization
    const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

    if (membership) {
        redirect('/dashboard')
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/30">
                            <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Setup your Organization</CardTitle>
                    <CardDescription>
                        Tell us about your agency so we can tailor the AI for you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createOrganizationAction} className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="orgName">Organization Name</Label>
                            <Input id="orgName" name="orgName" placeholder="Acme Agency, Inc." required minLength={2} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Select name="industry" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="software">Software Dev</SelectItem>
                                        <SelectItem value="consulting">Consulting</SelectItem>
                                        <SelectItem value="design">Design/Creative</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="size">Company Size</Label>
                                <Select name="size" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-5">1-5 Employees</SelectItem>
                                        <SelectItem value="6-20">6-20 Employees</SelectItem>
                                        <SelectItem value="21-50">21-50 Employees</SelectItem>
                                        <SelectItem value="50+">50+ Employees</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="website">Website URL (Optional)</Label>
                            <Input id="website" name="website" placeholder="https://acme.com" type="url" />
                        </div>

                        <Button type="submit" size="lg" className="w-full">
                            Create Workspace
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
