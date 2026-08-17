import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * Inter is named in the Tailwind theme but was never actually loaded, so every
 * page silently fell back to the system UI font.
 *
 * Loaded with a plain stylesheet link rather than `next/font/google` on
 * purpose: next/font downloads the font at BUILD time, which makes every build
 * — including the offline rebuilds our launcher scripts run — fail without
 * internet access. `display=swap` plus preconnect keeps the runtime cost small.
 */

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "SURA SHOP — Your Shop. One Link.",
    template: "%s | SURA SHOP",
  },
  description:
    "Create a professional digital shop, showcase your products, and turn WhatsApp conversations into customers.",
  applicationName: "SURA SHOP",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
