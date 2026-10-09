import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sankalvys — Your Daily Sanctuary",
  description: "Your daily sanctuary for intentional habits and calm momentum. Build lasting habits with mindful tracking, streaks, analytics, and daily reflections.",
  keywords: ["habit tracker", "productivity", "mindfulness", "daily routines", "streak tracker"],
  authors: [{ name: "Sankalvys" }],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased" suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
