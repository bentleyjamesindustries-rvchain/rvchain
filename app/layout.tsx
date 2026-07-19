import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import DeviceAdapt from "@/components/DeviceAdapt";
import ScenicBackground from "@/components/ScenicBackground";
import RvMouseTrail from "@/components/RvMouseTrail";
import DemoBanner from "@/components/DemoBanner";
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

export const metadata: Metadata = {
  title: "rvchain — Demo · Family Road Life",
  description:
    "Demonstration app for RV community tools. Sample parks, market listings, and brand names are fictional. No real sales or third-party brand affiliations.",
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
        <ScenicBackground />
        <RvMouseTrail />
        <DeviceAdapt />
        <div className="relative z-10 flex flex-col flex-1 min-h-full">
          {SITE_DEMO_MODE && <DemoBanner />}
          {children}
        </div>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
