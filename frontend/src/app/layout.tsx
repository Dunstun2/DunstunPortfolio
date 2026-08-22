import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { TemplateProvider } from "@/templateEngine";
import ThemeProvider from "@/components/ThemeProvider";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";
import { SiteModeProvider } from "@/utils/useSiteMode";

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
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <Suspense fallback={null}>
            <SiteModeProvider>
              <TemplateProvider>
                <AnalyticsProvider />
                <PublicLayoutWrapper>
                  {children}
                </PublicLayoutWrapper>
              </TemplateProvider>
            </SiteModeProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

