"use client";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const title = "CN.";

const navItems = [
  { name: "Home", href: "https://cnexans.com" },
  { name: "Blog", href: "https://cnexans.com/blog" },
  { name: "Mis proyectos", href: null },
  { name: "About", href: "https://cnexans.com/about" },
  { name: "Contact", href: "https://cnexans.com/contact" },
];

function NavLink({ item }: { item: (typeof navItems)[number] }) {
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
  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
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
          <div className="flex justify-center">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden md:block lg:hidden">
          <div className="flex items-center justify-between mb-4">
            <a
              href="https://cnexans.com"
              className="text-xl font-bold text-foreground no-underline font-merienda"
            >
              {title}
            </a>
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </nav>
          </div>
          <div className="flex justify-center">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between">
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
              <ThemeSwitcher />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
