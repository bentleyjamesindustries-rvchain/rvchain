"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Compass, Handshake, LayoutGrid } from "lucide-react";
import { t } from "@/lib/copy";
import { useRvStore } from "@/lib/rv-store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useRvStore((s) => s.locale);
  const setLocale = useRvStore((s) => s.setLocale);
  const copy = t(locale);

  useEffect(() => {
    document.documentElement.lang = locale === "es" ? "es" : "en";
  }, [locale]);

  const bottom = [
    { to: "/", label: copy.home, icon: Compass, match: pathname === "/", scan: false },
    {
      to: "/market",
      label: copy.market,
      icon: LayoutGrid,
      match:
        pathname.startsWith("/market") ||
        pathname.startsWith("/listings") ||
        pathname.startsWith("/ads"),
      scan: false,
    },
    { to: "/scan", label: copy.scan, icon: Camera, match: pathname.startsWith("/scan"), scan: true },
    {
      to: "/sponsors",
      label: copy.sponsors,
      icon: Handshake,
      match: pathname.startsWith("/sponsors"),
      scan: false,
    },
  ] as const;

  return (
    <div className="relative min-h-dvh text-fg">
      <div className="rv-scene-fixed" aria-hidden>
        <img src="/rvchain-scene-bg.jpg" alt="" className="rv-scene-img" />
      </div>
      <div className="rv-scene-overlay" aria-hidden />

      <div className="relative z-10">
        <header className="rv-header sticky top-0 z-30">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16">
            <Link href="/" className="flex min-w-0 items-center gap-2.5">
              <span className="rv-mark size-9 shrink-0 overflow-hidden sm:size-10">
                <img
                  src="/rvchain-mark.jpg"
                  alt=""
                  className="size-full object-cover object-[center_18%]"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-semibold uppercase tracking-[0.12em] text-fg sm:text-xl">
                  rvchain
                </span>
                <span className="hidden text-[10px] font-medium uppercase tracking-[0.22em] text-primary sm:block">
                  {copy.kicker}
                </span>
              </span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {[
                { to: "/scan", label: copy.scan },
                { to: "/market", label: copy.market },
                { to: "/sponsors", label: copy.sponsors },
              ].map((item) => (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "relative inline-flex h-10 items-center rounded-md px-3 text-sm font-semibold transition-colors duration-150",
                    pathname.startsWith(item.to) ? "text-primary" : "text-muted hover:text-fg",
                  )}
                >
                  {item.label}
                  {pathname.startsWith(item.to) ? (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
                  ) : null}
                </Link>
              ))}
            </nav>
            <div className="flex rounded-xl border border-border bg-bg/40 p-0.5 text-xs font-bold">
              {(["en", "es"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={cn(
                    "h-7 min-w-8 rounded-lg px-2 uppercase",
                    locale === code ? "bg-primary text-primary-fg" : "text-muted",
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:pb-12">{children}</div>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
          <div className="grid grid-cols-4 px-1 py-1.5">
            {bottom.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-bold",
                  item.match ? "text-primary" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center",
                    item.scan &&
                      "-mt-5 size-12 rounded-full bg-primary text-primary-fg shadow-[var(--shadow-border)]",
                  )}
                >
                  <item.icon className="size-5" />
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
