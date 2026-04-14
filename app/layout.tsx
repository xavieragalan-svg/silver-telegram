import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIE Study App",
  description:
    "Practice SIE questions, review mistakes, and track your progress.",
};

const navLinkClass =
  "text-sm font-medium text-white/80 transition hover:text-white";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased bg-slate-100 text-slate-900">
        <header className="bg-[#0033A0] shadow-md">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-white"
            >
              SIE Study App
            </Link>
            <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Main">
              <Link href="/" className={navLinkClass}>
                Home
              </Link>
              <Link href="/quiz" className={navLinkClass}>
                Quiz
              </Link>
              <Link href="/results" className={navLinkClass}>
                Results
              </Link>
              <Link href="/review" className={navLinkClass}>
                Review
              </Link>
              <Link href="/progress" className={navLinkClass}>
                Progress
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
