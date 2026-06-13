import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "PC Price Tracker — Find the Best PC Component Prices",
    template: "%s | PC Price Tracker",
  },
  description:
    "Track prices on CPUs, GPUs, motherboards, RAM, SSDs, and more from Amazon, Newegg, Best Buy, and other top retailers.",
  keywords: ["PC parts", "price tracker", "CPU prices", "GPU prices", "PC components"],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "PC Price Tracker",
    description: "Find the best prices on PC components from top retailers.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
