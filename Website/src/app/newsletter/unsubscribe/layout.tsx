import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email preferences",
  description: "Manage your Imperium email preferences.",
  alternates: { canonical: "https://secretimperium.com/newsletter/unsubscribe/" },
  robots: { index: false, follow: false },
};

export default function EmailPreferencesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
