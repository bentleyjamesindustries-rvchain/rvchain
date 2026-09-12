import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { LanguageProvider } from "@/lib/i18n/context";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rv-chain.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#07080b",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RV Chain — Powersports parts board",
    template: "%s | RV Chain",
  },
  description:
    "Dirt. Asphalt. Ready. Snap a part, get a summary, then search or list it. ATV, truck, dirt bike, racecar, and snowmobile parts. Private-party board.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "RV Chain",
    title: "RV Chain — Dirt. Asphalt. Ready.",
    description: "Identify a powersports part from a photo, then search or list it.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "RV Chain" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RV Chain",
    description: "Powersports parts board — snap, identify, list.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/rvchain-mark.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-fg overflow-x-hidden">
        <LanguageProvider>
          <GoogleAnalytics />
          {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              color: "var(--color-fg)",
              border: "1px solid var(--color-border)",
            },
          }}
        />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
