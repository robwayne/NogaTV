import type { Metadata } from "next";
import { SITE } from "@/data/content";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: `${SITE.title} — for ${SITE.herName}`,
  description: SITE.subtitle,
  // It's a gift, not a blog post. Keep it out of search results.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="crt min-h-screen antialiased">
        <div className="tracking-bar" aria-hidden />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
