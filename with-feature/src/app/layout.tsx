import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "PulseBoard - Analytics Dashboard",
  description: "Real-time SaaS analytics dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
