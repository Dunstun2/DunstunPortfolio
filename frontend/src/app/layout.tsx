import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import SocialFloater from "@/components/layout/SocialFloater";
import ContactCTA from "@/components/layout/ContactCTA";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import BackButton from "@/components/layout/BackButton";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Premium Portfolio',
    default: 'Premium Portfolio - Software Engineer & Designer',
  },
  description: "A stunning modern portfolio showcasing projects, experience, and skills in software development and engineering.",
  keywords: ["Software Engineer", "Web Developer", "Portfolio", "Projects", "React", "Next.js"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: 'Premium Portfolio - Software Engineer',
    description: 'A stunning modern portfolio showcasing projects, experience, and skills.',
    url: 'https://yourportfolio.com',
    siteName: 'Premium Portfolio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Portfolio',
    description: 'A stunning modern portfolio showcasing projects, experience, and skills.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <AnalyticsProvider />
          <Navbar />
          <SocialFloater />
          <BackButton />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <ContactCTA />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
