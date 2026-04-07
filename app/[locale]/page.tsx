import { Dashboard } from "@/components/Dashboard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fetchAggregatedMetrics } from "@/lib/posthog";
import type { AggregatedMetrics } from "@/lib/posthog";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const revalidate = 3600;

async function getMetrics(): Promise<AggregatedMetrics | null> {
  try {
    return await fetchAggregatedMetrics();
  } catch (e) {
    console.error("Failed to fetch metrics:", e);
    return null;
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const metrics = await getMetrics();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-10 flex-1 w-full">
        {/* Hero */}
        <section>
          <h1 className="text-4xl font-bold font-serif my-4">
            {t("hero.title")}
          </h1>
          <p className="text-lg leading-8 text-foreground font-serif">
            {t.rich("hero.description", {
              link: (chunks) => (
                <a
                  href="https://github.com/cnexans/buildinpublic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>

        {/* Project Cards */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Planify.la", description: t("projects.planify.description"), url: "https://planify.la", color: "#2563EB" },
              { name: "Impuesti.to", description: t("projects.impuestito.description"), url: "https://impuesti.to", color: "#059669" },
              { name: "Codex", description: t("projects.libro.description"), url: "https://codex.cnexans.com", color: "#0891B2" },
            ].map(({ name, description, url, color }) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block border border-border rounded-xl p-5 bg-card hover:border-foreground/30 transition-colors no-underline"
                style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
              >
                <p className="font-semibold text-foreground text-sm mb-1 group-hover:underline">
                  {name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Dashboard */}
        {metrics ? (
          <Dashboard metrics={metrics} />
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-4">{t("empty.emoji")}</p>
            <p className="font-semibold">{t("empty.title")}</p>
            <p className="text-sm mt-1">{t("empty.subtitle")}</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
