"use client"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"

const languages = {
  es: { name: "Español" },
  en: { name: "English" },
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale as "es" | "en" })
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <select
          value={locale}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-background text-foreground border border-border rounded-md px-3 py-1 text-sm font-medium cursor-pointer hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring appearance-none pr-8"
        >
          {Object.entries(languages).map(([code, lang]) => (
            <option key={code} value={code}>
              {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
