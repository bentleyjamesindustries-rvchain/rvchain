import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "sonner";
import DeviceAdapt from "@/components/DeviceAdapt";
import ScenicBackground from "@/components/ScenicBackground";
import RvMouseTrail from "@/components/RvMouseTrail";
import DemoBanner from "@/components/DemoBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { SITE_DEMO_MODE } from "@/lib/demoMode";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#14532d",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rv-chain.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "rvchain — Gear & Parts for Family Road Life",
    template: "%s | rvchain",
  },
  description:
    "Private-party camping gear and parts marketplace for road families. List items, contact sellers directly. Not a campground directory. Not a vehicle dealer.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "rvchain",
    title: "rvchain — Gear & Parts for Family Road Life",
    description:
      "Private-party gear and parts board for people who live on the road. Simple listings. Direct contact. No escrow cut.",
    images: [{ url: "/rvchain-logo.jpg", width: 512, height: 512, alt: "rvchain" }],
  },
  twitter: {
    card: "summary",
    title: "rvchain — Gear & Parts Market",
    description: "Private-party gear and parts for family road life.",
  },
  icons: {
    icon: "/rvchain-logo.jpg",
    apple: "/rvchain-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col text-slate-200 overflow-x-hidden">
        <GoogleAnalytics />
        <ScenicBackground />
        <RvMouseTrail />
        <DeviceAdapt />
        <div className="relative z-10 flex flex-col flex-1 min-h-full">
          {SITE_DEMO_MODE && <DemoBanner />}
          {children}
        </div>
        <Toaster position="top-center" richColors closeButton />
        <Analytics />
      </body>
    </html>
  );
}
