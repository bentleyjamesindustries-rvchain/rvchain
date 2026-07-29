import Link from 'next/link';
import SiteFooter from './SiteFooter';

export default function MarketingPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-700 bg-slate-950 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-white tracking-tight text-lg">
            rvchain
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4 text-sm">
            <Link
              href="/contact"
              className="text-amber-300 hover:text-amber-200 font-semibold"
            >
              Contact
            </Link>
            <Link href="/" className="text-slate-200 hover:text-white font-medium hidden sm:inline">
              Market
            </Link>
            <Link href="/about" className="text-slate-200 hover:text-white hidden md:inline">
              About
            </Link>
            <Link
              href="/"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm"
            >
              Open app
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <article className="rounded-3xl border border-slate-600 bg-slate-900 shadow-xl shadow-black/40 px-5 sm:px-8 py-8 sm:py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6 leading-tight">
            {title}
          </h1>
          <div className="prose-rv space-y-5 text-slate-100 text-base sm:text-[17px] leading-relaxed">
            {children}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
