import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
// import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Battle Protocol - AI-Driven Tactical Combat Game",
  description:
    "Program your fighter with custom AI protocols in this Megaman Battle Network-inspired tactical combat game. Create trigger-action pairs, unlock new abilities, and battle through waves of enemies in a cyberpunk arena.",
  keywords: [
    "battle game",
    "tactical combat",
    "AI programming",
    "megaman battle network",
    "protocol system",
    "cyberpunk game",
    "browser game",
    "strategy game",
    "gambit system",
    "final fantasy 12",
  ],
  authors: [{ name: "Battle Protocol Team" }],
  creator: "Battle Protocol",
  publisher: "Battle Protocol",
  generator: "v0.app",
  applicationName: "Battle Protocol",
  category: "game",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://battleprotocol.vercel.app",
    title: "Battle Protocol - AI-Driven Tactical Combat Game",
    description:
      "Program your fighter with custom AI protocols. Create trigger-action pairs and battle through waves of enemies in a cyberpunk arena.",
    siteName: "Battle Protocol",
  },
  twitter: {
    card: "summary_large_image",
    title: "Battle Protocol - AI-Driven Tactical Combat Game",
    description:
      "Program your fighter with custom AI protocols. Create trigger-action pairs and battle through waves of enemies.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
