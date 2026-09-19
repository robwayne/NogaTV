import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { ProfileBar } from "@/components/ProfileBar";
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
        <StoreProvider>
          <ProfileBar />
          <Nav />
          <main>{children}</main>
          <footer className="mx-auto w-full max-w-5xl px-4 pb-14 pt-4 text-[0.6rem] uppercase tracking-[0.3em] text-vhs-line">
            ■ stop — happy birthday, {SITE.herName}. eat something.
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
