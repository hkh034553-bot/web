import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import PageTransition from "@/components/PageTransition";
import MotionProvider from "@/components/MotionProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HKH Agency | Scale Your Brand with Conversion-Focused Campaigns",
  description:
    "We build high-performance custom websites, premium branding, and conversion-focused social campaigns for startups and SMEs. Zero templates. Direct execution.",
  metadataBase: new URL("https://hkh.agency"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-text font-sans flex flex-col">
        <ThemeProvider>
          <MotionProvider>
            <PageTransition>{children}</PageTransition>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
