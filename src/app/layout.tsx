import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pitchd",
  description: "Pitch booking and club management for amateur football clubs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
