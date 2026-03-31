"use client";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

const title = "CN.";

function NavLink({ item }: { item: { name: string; href: string | null } }) {
  if (item.href) {
    return (
      <a
        href={item.href}
        className="text-sm text-foreground no-underline hover:text-primary transition-colors"
      >
        {item.name}
      </a>
    );
  }
  return (
    <span className="text-sm text-primary font-medium">{item.name}</span>
  );
}

export function Header() {
  const t = useTranslations("header");

  const navItems = [
    { name: t("home"), href: "https://cnexans.com" },
    { name: t("blog"), href: "https://cnexans.com/blog" },
    { name: t("projects"), href: null },
    { name: t("about"), href: "https://cnexans.com/about" },
    { name: t("contact"), href: "https://cnexans.com/contact" },
  ];

  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {/* Mobile Layout */}
        <div className="flex flex-col space-y-4 md:hidden">
          <div className="flex justify-center">
            <a
              href="https://cnexans.com"
              className="text-xl font-bold text-foreground no-underline font-merienda"
            >
              {title}
            </a>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {navItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
          <div className="flex justify-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <a
            href="https://cnexans.com"
            className="text-2xl font-bold text-foreground no-underline font-merienda"
          >
            {title}
          </a>
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
            <LanguageSwitcher />
            <ThemeSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}
