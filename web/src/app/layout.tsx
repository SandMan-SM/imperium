import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

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
        <AuthProvider>
            <CartProvider>
              <Header />
              {/* Offset main content by the fixed header height to avoid content being cut off */}
              <main className="pt-[72px] min-h-screen bg-imperium-bg">
                {children}
              </main>
            </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
