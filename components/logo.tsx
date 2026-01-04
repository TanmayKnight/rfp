
import React from 'react'

export function Logo({ className = "h-8 w-8", showText = false }: { className?: string, showText?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <svg
                className={className}
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M6 10L16 26L26 4"
                    stroke="url(#paint0_linear)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M6 10L16 16L26 4"
                    stroke="url(#paint1_linear)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                />
                <defs>
                    <linearGradient
                        id="paint0_linear"
                        x1="6"
                        y1="4"
                        x2="26"
                        y2="26"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#2563EB" /> {/* blue-600 */}
                        <stop offset="1" stopColor="#9333EA" /> {/* purple-600 */}
                    </linearGradient>
                    <linearGradient
                        id="paint1_linear"
                        x1="6"
                        y1="4"
                        x2="26"
                        y2="26"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#2563EB" />
                        <stop offset="1" stopColor="#9333EA" />
                    </linearGradient>
                </defs>
            </svg>
            {showText && <span className="font-bold text-xl tracking-tight text-zinc-900">Velocibid</span>}
        </div>
    )
}
