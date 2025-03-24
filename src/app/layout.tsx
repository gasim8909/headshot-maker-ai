import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Headshot Maker AI | Professional AI Headshot Generator",
  description: "Transform your photos into professional headshots with AI. Perfect for LinkedIn, resumes, and professional profiles.",
  keywords: "ai headshot, professional photos, linkedin headshot, ai generator, profile picture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7C3AED" />
      </head>
      <body className="antialiased font-sans ai-grid-pattern min-h-screen">
        <ClientLayout>
          <div className="relative z-10">
            {children}
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
