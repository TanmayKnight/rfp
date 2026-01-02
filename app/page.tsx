
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, FileText, Upload, Brain } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* Navigation */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80 fixed w-full top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <img src="/logo.png" alt="Velocibid Logo" className="h-8 w-8" />
          <span>Velocibid</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Log In
          </Link>
          <Link href="/signup">
            <Button>Start Free Trial</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section - Single Screen */}
      <main className="flex-1 flex items-center justify-center pt-16">
        <div className="container px-4 md:px-6 mx-auto grid lg:grid-cols-2 gap-12 items-center h-full max-h-[900px]">
          {/* Left Column: Copy */}
          <div className="flex flex-col space-y-6 text-left p-4">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Win RFPs <br /> 10x Faster.
            </h1>
            <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
              Velocibid is your AI proposal intern. Stop wasting hours on manual responses.
              Securely upload your docs, and let our AI do the heavy lifting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-lg w-full sm:w-auto">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400 pt-4">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" /> SOC2 Compliant
              </div>
              <div>•</div>
              <div>No Credit Card Required</div>
            </div>
          </div>

          {/* Right Column: Visual Features (Cards) */}
          <div className="hidden lg:grid grid-cols-1 gap-6 p-4 opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards" style={{ animationDelay: '0.2s', opacity: 1 }}>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <Upload className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">1. Train Your Brain</h3>
              <p className="text-sm text-gray-500">Upload past proposals & case studies to build your secure Knowledge Base.</p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <Brain className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">2. Auto-Extract Questions</h3>
              <p className="text-sm text-gray-500">AI parses the RFP PDF and finds every question needing an answer.</p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <FileText className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">3. Generate & Export</h3>
              <p className="text-sm text-gray-500">One-click draft generation with citations. Export to Word perfectly.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
