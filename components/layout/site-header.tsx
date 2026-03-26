"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { AuthControls } from "@/components/auth/auth-controls";
import type { AuthUser, Locale } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { SiteLogo } from "@/components/shared/site-logo";

type SiteHeaderProps = {
  currentUser: AuthUser | null;
  locale: Locale;
  dictionary: Dictionary;
};

const navTargets = [
  { key: "accessibility", path: "/accessibility" },
  { key: "events", path: "/events" },
  { key: "dailyCorner", path: "/daily-corner" },
  { key: "contact", path: "/contact" },
  { key: "diseaseInformation", path: "/disease-information" },
  { key: "community", path: "/community" }
] as const;

function swapLocale(pathname: string, nextLocale: Locale) {
  const segments = pathname.split("/");

  if (segments.length > 1 && (segments[1] === "mn" || segments[1] === "en")) {
    segments[1] = nextLocale;
    return segments.join("/") || `/${nextLocale}`;
  }

  return `/${nextLocale}`;
}

export function SiteHeader({
  currentUser,
  locale,
  dictionary
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const alternateLocale: Locale = locale === "mn" ? "en" : "mn";
  const alternateHref = swapLocale(pathname, alternateLocale);

  return (
    <header className="site-header">
      <div className="container header-topline">
        <div className="brand-mark">
          <Link className="brand-link" href={`/${locale}`}>
            <SiteLogo size="medium" />
            <span className="brand-wordmark">
              <strong>{dictionary.siteName}</strong>
              <span>{dictionary.common.siteRegion}</span>
            </span>
          </Link>
        </div>
        <nav className="header-utility" aria-label="Top utility navigation">
          {navTargets.slice(0, 4).map((item) => (
            <Link key={item.key} href={`/${locale}${item.path}`}>
              {dictionary.nav[item.key]}
            </Link>
          ))}
          <Link className="language-chip" href={alternateHref}>
            {dictionary.alternateLanguageLabel}
          </Link>
        </nav>
      </div>
      <div className="container header-main">
        <nav className="header-nav" aria-label="Primary">
          {navTargets.slice(4).map((item) => {
            const href = `/${locale}${item.path}`;
            const active =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={item.key}
                className={active ? "is-active" : undefined}
                href={href}
              >
                {dictionary.nav[item.key]}
              </Link>
            );
          })}
          <Link
            className={`donate-link${
              pathname.startsWith(`/${locale}/donation`) ? " is-active" : ""
            }`}
            href={`/${locale}/donation`}
          >
            {dictionary.nav.donate}
          </Link>
        </nav>
        <form
          action={`/${locale}/disease-information`}
          className="header-search"
          role="search"
        >
          <label className="sr-only" htmlFor="header-search">
            {dictionary.common.search}
          </label>
          <input
            defaultValue=""
            id="header-search"
            name="query"
            placeholder={dictionary.nav.searchPlaceholder}
            type="search"
          />
          <button aria-label={dictionary.common.search} type="submit">
            <Search size={18} />
          </button>
        </form>
        <button
          aria-expanded={menuOpen}
          aria-label={
            menuOpen ? dictionary.common.closeMenu : dictionary.common.openMenu
          }
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          type="button"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <AuthControls currentUser={currentUser} dictionary={dictionary} />
      </div>
      {menuOpen ? (
        <div className="mobile-panel">
          <div className="container mobile-panel-inner">
            {navTargets.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.path}`}
                onClick={() => setMenuOpen(false)}
              >
                {dictionary.nav[item.key]}
              </Link>
            ))}
            <Link href={`/${locale}/donation`} onClick={() => setMenuOpen(false)}>
              {dictionary.nav.donate}
            </Link>
            <Link href={alternateHref} onClick={() => setMenuOpen(false)}>
              {dictionary.alternateLanguageLabel}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
