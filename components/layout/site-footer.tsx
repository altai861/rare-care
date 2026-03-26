import Link from "next/link";

import { SiteLogo } from "@/components/shared/site-logo";
import type { Locale } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type SiteFooterProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function SiteFooter({ locale, dictionary }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <SiteLogo size="large" />
          <div>
            <h2>{dictionary.siteName}</h2>
            <p>{dictionary.footer.tagline}</p>
          </div>
        </div>
        <div>
          <h3>{dictionary.footer.quickLinks}</h3>
          <div className="footer-links">
            <Link href={`/${locale}`}>{dictionary.common.home}</Link>
            <Link href={`/${locale}/disease-information`}>
              {dictionary.nav.diseaseInformation}
            </Link>
            <Link href={`/${locale}/events`}>{dictionary.nav.events}</Link>
            <Link href={`/${locale}/daily-corner`}>
              {dictionary.nav.dailyCorner}
            </Link>
          </div>
        </div>
        <div>
          <h3>{dictionary.footer.support}</h3>
          <div className="footer-links">
            <Link href={`/${locale}/community`}>{dictionary.nav.community}</Link>
            <Link href={`/${locale}/donation`}>{dictionary.nav.donate}</Link>
            <Link href={`/${locale}/contact`}>{dictionary.nav.contact}</Link>
            <Link href={`/${locale}/accessibility`}>
              {dictionary.nav.accessibility}
            </Link>
          </div>
        </div>
        <div>
          <h3>{dictionary.footer.legal}</h3>
          <div className="footer-links">
            <Link href={`/${locale}/privacy-policy`}>
              {dictionary.footer.privacy}
            </Link>
            <Link href={`/${locale}/disclaimer`}>
              {dictionary.footer.disclaimer}
            </Link>
            <Link href={`/${locale}/accessibility`}>
              {dictionary.footer.accessibility}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
