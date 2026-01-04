import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'none',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg
                    width="32"
                    height="32"
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
                            <stop stopColor="#2563EB" />
                            <stop offset="1" stopColor="#9333EA" />
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
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
