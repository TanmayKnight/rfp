'use client'

import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogDescription,
    DialogHeader
} from "@/components/ui/dialog"
import { Play, RotateCcw } from "lucide-react"
import { useState, useEffect } from 'react'

const slides = [
    { src: '/demo-upload.png', label: '1. Upload RFP' },
    { src: '/dashboard-preview.png', label: '2. AI Analysis' },
    { src: '/demo-export.png', label: '3. Download Proposal' },
]

export function DemoModal({ children }: { children: React.ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length)
            }, 3000)
        }
        return () => clearInterval(interval)
    }, [isPlaying])

    const startDemo = () => {
        setIsPlaying(true)
        setCurrentSlide(0)
    }

    const resetDemo = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsPlaying(false)
        setCurrentSlide(0)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-zinc-950 border-zinc-800">
                <DialogHeader className="sr-only">
                    <DialogTitle>Product Demo</DialogTitle>
                    <DialogDescription>
                        A walkthrough of the Velocibid platform showing RFP automation features.
                    </DialogDescription>
                </DialogHeader>
                <div
                    className="aspect-video w-full relative group cursor-pointer bg-zinc-900 flex items-center justify-center overflow-hidden"
                    onClick={!isPlaying ? startDemo : undefined}
                >
                    {/* Slides */}
                    {slides.map((slide, index) => (
                        <div
                            key={slide.src}
                            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out ${isPlaying && currentSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                                } ${!isPlaying && index === 1 ? 'opacity-50' : ''}`} // Show dim dashboard as cover
                            style={{ backgroundImage: `url('${slide.src}')` }}
                        />
                    ))}

                    {/* Initial Cover Overlay */}
                    <div className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />

                    {/* Play Button Overlay */}
                    <div className={`relative z-10 flex flex-col items-center gap-4 transition-all duration-500 ${isPlaying ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                        <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-2xl">
                            <Play className="h-8 w-8 text-white fill-white ml-1" />
                        </div>
                        <div className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                            Start Interactive Tour
                        </div>
                    </div>

                    {/* Controls (Visible when playing) */}
                    <div className={`absolute bottom-6 left-0 right-0 flex sm:flex-row flex-col items-center justify-center gap-4 transition-all duration-500 ${isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        {/* Indicators */}
                        <div className="flex gap-2 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-blue-500 w-8' : 'bg-white/30 hover:bg-white/50'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Caption */}
                        <div className="hidden sm:block text-white/90 text-sm font-medium bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            {slides[currentSlide].label}
                        </div>

                        {/* Reset button */}
                        <button
                            onClick={resetDemo}
                            className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            aria-label="Reset Demo"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
