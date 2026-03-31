import { Dashboard } from "@/components/Dashboard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fetchAggregatedMetrics } from "@/lib/posthog";
import type { AggregatedMetrics } from "@/lib/posthog";

export const revalidate = 3600;

async function getMetrics(): Promise<AggregatedMetrics | null> {
  try {
    return await fetchAggregatedMetrics();
  } catch (e) {
    console.error("Failed to fetch metrics:", e);
    return null;
  }
}

export default async function Home() {
  const metrics = await getMetrics();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-10 flex-1 w-full">
        {/* Hero */}
        <section>
          <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-2">
            Mis proyectos
          </h1>
          <p className="text-muted-foreground font-serif">
            Estos son los proyectos en los que trabajo. Aquí puedes ver sus métricas
            de tráfico en tiempo real, actualizadas cada hora.
            El código fuente de esta página es{" "}
            <a
              href="https://github.com/cnexans/buildinpublic"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              open source
            </a>
            .
          </p>
        </section>

        {/* Dashboard */}
        {metrics ? (
          <Dashboard metrics={metrics} />
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-4">📊</p>
            <p className="font-semibold">No hay métricas disponibles.</p>
            <p className="text-sm mt-1">Vuelve pronto.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
