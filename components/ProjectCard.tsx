import { ProjectMetrics } from "@/lib/posthog";
import { MetricCard } from "./MetricCard";
import { MiniChart } from "./MiniChart";
import { TopPages } from "./TopPages";

type ProjectCardProps = {
  metrics: ProjectMetrics;
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

export function ProjectCard({ metrics }: ProjectCardProps) {
  const colorIndex = metrics.projectId % COLORS.length;
  const color = COLORS[colorIndex];

  const updatedAt = new Date(metrics.fetchedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <section className="bg-gray-50 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2"
            style={{ backgroundColor: color + "20", color }}
          >
            {metrics.orgName}
          </span>
          <h2 className="text-2xl font-bold text-gray-900">{metrics.projectName}</h2>
        </div>
        <span className="text-xs text-gray-400 shrink-0 mt-1">
          Updated {updatedAt}
        </span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Pageviews"
          value={metrics.pageviews}
          icon="📄"
          description="Last 30 days"
        />
        <MetricCard
          label="Unique Visitors"
          value={metrics.uniqueVisitors}
          icon="👤"
          description="Last 30 days"
        />
        <MetricCard
          label="Sessions"
          value={metrics.sessions}
          icon="🔗"
          description="Last 30 days"
        />
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">
          Pageviews — Daily trend (30 days)
        </h3>
        <MiniChart data={metrics.pageviewsTrend} color={color} />
        {/* X-axis labels */}
        {metrics.pageviewsTrend.length > 0 && (
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-300">
              {metrics.pageviewsTrend[0]?.date}
            </span>
            <span className="text-xs text-gray-300">
              {metrics.pageviewsTrend[metrics.pageviewsTrend.length - 1]?.date}
            </span>
          </div>
        )}
      </div>

      {/* Top pages */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">
          Top Pages — Last 30 days
        </h3>
        <TopPages pages={metrics.topPages} />
      </div>
    </section>
  );
}
