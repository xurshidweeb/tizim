import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IT Time Academy — Coin Market CRM",
  description: "O'quvchilarni rag'batlantiruvchi coin (mukofot ball) va markaz boshqaruvi tizimi",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IT Time CRM",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={plusJakarta.variable}>
      <body className="antialiased bg-slate-100/70 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white min-h-screen relative overflow-x-hidden">
        {/* Ambient iOS background light orbs for liquid glass depth */}
        <div className="fixed top-[-10%] left-[-5%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-emerald-400/15 blur-[100px] pointer-events-none -z-10 animate-pulse" />
        <div className="fixed top-[30%] right-[-10%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] rounded-full bg-amber-400/12 blur-[120px] pointer-events-none -z-10" />
        <div className="fixed bottom-[-10%] left-[20%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-teal-400/12 blur-[100px] pointer-events-none -z-10" />

        {children}
      </body>
    </html>
  );
}
