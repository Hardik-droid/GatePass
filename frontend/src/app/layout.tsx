import type { Metadata } from "next";
import { Anton, Cinzel, Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const display = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const body = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const luxury = Cormorant_Garamond({
  variable: "--font-luxury",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const label = Cinzel({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gatepass.local"),
  title: "GatePass | Event Ticketing and QR Entry Control",
  description:
    "Organizer-first ticketing, secure QR passes, live gate control, hostel gate passes, and clear settlement reporting for schools, campuses, workshops, and local shows.",
  openGraph: {
    title: "GatePass",
    description:
      "Launch events, sell tickets, validate secure QR passes, and run event-day operations with full clarity.",
    images: ["/app-event-page.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${luxury.variable} ${label.variable}`}>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
