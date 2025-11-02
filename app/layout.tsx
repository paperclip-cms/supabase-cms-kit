import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import MainLayout from "@/components/layout/main-layout";
import Header from "@/components/layout/header";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Paperclip CMS",
  description: "A tiny, simple CMS built for Supabase",
};

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-[#f5f5f5] dark:bg-[#0a0a0a]`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <MainLayout header={<Header />}>
            {children}
          </MainLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
