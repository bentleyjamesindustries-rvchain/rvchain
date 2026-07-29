import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 mt-auto bg-slate-950/80">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-semibold text-white text-lg tracking-tight">rvchain</div>
            <p className="text-slate-300 mt-2 text-sm leading-relaxed max-w-xs">
              Private-party gear &amp; parts for family road life. Not a campground directory. Not a
              vehicle dealer.
            </p>
            <p className="mt-3 text-sm">
              <a
                href="mailto:admin@rv-chain.com"
                className="text-amber-300 font-semibold hover:text-amber-200 underline"
              >
                admin@rv-chain.com
              </a>
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-3">
              Company
            </div>
            <ul className="space-y-2 text-slate-100 font-medium">
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-3">
              Guides
            </div>
            <ul className="space-y-2 text-slate-100 font-medium">
              <li>
                <Link href="/guides/essential-gear-checklist" className="hover:text-white">
                  Essential gear checklist
                </Link>
              </li>
              <li>
                <Link href="/guides/buy-sell-used-rv-parts" className="hover:text-white">
                  Buy &amp; sell used parts safely
                </Link>
              </li>
              <li>
                <Link href="/guides/sell-used-rv-gear-2026" className="hover:text-white">
                  Where to sell used gear
                </Link>
              </li>
              <li>
                <Link href="/guides/kids-on-the-road-gear" className="hover:text-white">
                  Kids on the road gear
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-8 text-center">
          © {new Date().getFullYear()} RV Chain LLC · Transactions are off-platform between buyers and
          sellers
        </p>
      </div>
    </footer>
  );
}
