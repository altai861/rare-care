import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { Locale } from "@/lib/data/types";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/request";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const dictionary = getDictionary(locale);
  const currentUser = await getCurrentUser();

  return (
    <div className="site-root">
      <SiteHeader
        currentUser={currentUser}
        locale={locale}
        dictionary={dictionary}
      />
      <main>{children}</main>
      <SiteFooter locale={locale} dictionary={dictionary} />
    </div>
  );
}
