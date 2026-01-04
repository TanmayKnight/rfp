
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText, Brain, Upload } from 'lucide-react'
import { Logo } from '@/components/logo'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans antialiased text-zinc-900 selection:bg-blue-100">

      {/* Navigation */}
      <header className="fixed w-full top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo showText={true} />
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Log In
            </Link>
            <Link href="/signup">
              <Button className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10 transition-all hover:scale-105">
                Start Free Trial
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex items-center justify-center pt-24 pb-12 lg:pt-0 lg:pb-0 min-h-screen">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

            {/* Left Column: Hero Text */}
            <div className="text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">

              <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-7xl leading-[1.1]">
                Win RFPs <br />
                <span className="text-blue-600">10x Faster.</span>
              </h1>

              <p className="text-lg text-zinc-500 leading-relaxed max-w-lg">
                Velocibid is your AI proposal intern. Stop wasting hours on manual responses.
                Securely upload your docs, and let our AI do the heavy lifting.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
                <Link href="/signup">
                  <Button size="lg" className="h-12 px-8 text-base bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-900/20 transition-all hover:-translate-y-0.5">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <div className="h-12 px-6 flex items-center justify-center text-zinc-500 text-sm hover:text-zinc-900 transition-colors cursor-pointer">
                    View Demo
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-xs text-zinc-400 font-medium pt-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div> SOC2 Compliant
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-300"></div> Cancel Anytime
                </div>
              </div>

            </div>

            {/* Right Column: Stacked Cards */}
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">

              {/* Card 1 */}
              <div className="group p-6 rounded-2xl bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 hover:border-blue-100">
                <div className="flex items-start gap-5">
                  <div className="h-10 w-10 shrink-0 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Upload className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1">1. Train Your Brain</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      Upload past proposals & case studies to build your secure Knowledge Base.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group p-6 rounded-2xl bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 hover:border-purple-100">
                <div className="flex items-start gap-5">
                  <div className="h-10 w-10 shrink-0 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1">2. Auto-Extract Questions</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      AI parses the RFP PDF and finds every question needing an answer.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group p-6 rounded-2xl bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 hover:border-green-100">
                <div className="flex items-start gap-5">
                  <div className="h-10 w-10 shrink-0 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1">3. Generate & Export</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      One-click draft generation with citations. Export to Word perfectly.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
