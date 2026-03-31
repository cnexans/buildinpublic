import {defineRouting} from 'next-intl/routing';

export const locales = ["en", "es"] as const;

export const routing = defineRouting({
  locales: locales,
  defaultLocale: "es",
  localePrefix: "as-needed",
  localeCookie: false,
  localeDetection: false,
});
