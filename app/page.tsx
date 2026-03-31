import { ProjectCard } from "@/components/ProjectCard";
import { ProjectMetrics } from "@/lib/posthog";

export const revalidate = 3600;

async function getMetrics(): Promise<ProjectMetrics[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}/api/metrics`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const metrics = await getMetrics();

  const totalPageviews = metrics.reduce((s, m) => s + m.pageviews, 0);
  const totalVisitors = metrics.reduce((s, m) => s + m.uniqueVisitors, 0);
  const totalSessions = metrics.reduce((s, m) => s + m.sessions, 0);

  return (
    <main className="min-h-screen bg-white">
      {/* Sticky header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight text-gray-900">
            my<span className="text-indigo-500">metrics</span>
          </span>
          <span className="text-xs text-gray-400">
            Public dashboard · updates every hour
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-12">
        {/* Summary hero */}
        <section>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Open metrics
          </h1>
          <p className="text-gray-500 mb-8">
            Real-time stats across all my projects, powered by PostHog.
            Refreshed hourly.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-indigo-600 tabular-nums">
                {totalPageviews.toLocaleString("en-US")}
              </p>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-1">
                Total Pageviews
              </p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-emerald-600 tabular-nums">
                {totalVisitors.toLocaleString("en-US")}
              </p>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-1">
                Unique Visitors
              </p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-amber-600 tabular-nums">
                {totalSessions.toLocaleString("en-US")}
              </p>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mt-1">
                Total Sessions
              </p>
            </div>
          </div>
        </section>

        {/* Per-project sections */}
        {metrics.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📊</p>
            <p className="font-semibold">No metrics available right now.</p>
            <p className="text-sm mt-1">Check back soon.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {metrics.map((m) => (
              <ProjectCard key={m.projectId} metrics={m} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-300 pb-8">
          Built with{" "}
          <a
            href="https://nextjs.org"
            className="underline hover:text-gray-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>{" "}
          +{" "}
          <a
            href="https://posthog.com"
            className="underline hover:text-gray-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            PostHog
          </a>
        </footer>
      </div>
    </main>
  );
}
