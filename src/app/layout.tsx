import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Geist, Noto_Serif_Devanagari } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: "The Universal Wisdom Academy — Wisdom Without Borders",
    template: "%s | The Universal Wisdom Academy",
  },
  description:
    "A global home for lifelong learning that unites people of all ages to share and discover practical life wisdom.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} ${notoSerifDevanagari.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-line py-10 text-center text-sm text-muted">
          <p className="font-display text-base text-ink">
            The Universal Wisdom Academy
          </p>
          <p className="mt-1">Wisdom Without Borders</p>
          <Link href="/privacy" className="mt-3 inline-block hover:text-ink hover:underline">
            Privacy Policy
          </Link>
        </footer>
      </body>
    </html>
  );
}
