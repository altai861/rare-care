import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Rare Care",
  description:
    "Rare Care is a calm, bilingual support platform for rare disease information, emotional support, events, and donation pathways in Mongolia."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
