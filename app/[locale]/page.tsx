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

      <main className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-10 flex-1 w-full">
        {/* Hero */}
        <section>
          <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-2">
            {t("hero.title")}
          </h1>
          <p className="text-foreground font-serif">
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
