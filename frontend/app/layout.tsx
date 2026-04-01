import { Geist, Geist_Mono, Inter } from "next/font/google"
import { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

import { Toaster } from "@/components/ui/sonner"

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "drafted.jobs | Command Center",
  description: "Advanced Job Hunting Platform",
};

import { ReduxProvider } from "@/lib/redux/provider";
import AuthGuard from "@/components/auth/AuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ReduxProvider>
          <AuthGuard>
            <ThemeProvider>
              {children}
              <Toaster 
                position="bottom-right" 
                richColors={false}
              />
            </ThemeProvider>
          </AuthGuard>
        </ReduxProvider>
      </body>
    </html>
  )
}
