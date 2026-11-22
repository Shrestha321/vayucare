import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VayuCare — GenAI Smog & Indoor Air Quality (IAQ) Copilot",
  description:
    "Evidence-based, personalized AI assistant helping families and urban communities navigate severe winter smog and toxic air pollution through time-blocked routines, room-by-room IAQ hacks, and sustainable swaps.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#090D16",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian-950 text-slate-100 antialiased min-h-screen flex flex-col selection:bg-cyan-500 selection:text-obsidian-950">
        {children}
      </body>
    </html>
  );
}
