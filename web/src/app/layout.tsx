import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imperium Elite — Build the Mind. Command the Future.",
  description: "A structured 28-principle leadership framework. Daily intelligence delivered to your inbox. Join 2,400+ sovereign-minded operators for $20/month.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="min-h-screen bg-imperium-bg">
          {children}
        </main>
      </body>
    </html>
  );
}
