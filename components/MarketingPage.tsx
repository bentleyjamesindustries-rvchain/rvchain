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
    <div className="min-h-screen flex flex-col text-slate-200">
      <header className="border-b border-green-900/50 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-white tracking-tight text-lg">
            rvchain
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/#market" className="text-amber-400 hover:text-amber-300 font-medium">
              Market
            </Link>
            <Link href="/about" className="text-slate-400 hover:text-white hidden sm:inline">
              About
            </Link>
            <Link
              href="/"
              className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl font-semibold text-xs sm:text-sm"
            >
              Open app
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">{title}</h1>
        <div className="prose-rv space-y-4 text-slate-300 text-[15px] leading-relaxed">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
