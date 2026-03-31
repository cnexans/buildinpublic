"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ProjectFilter } from "@/components/DomainFilter";
import type { AggregatedMetrics, ProjectStats } from "@/lib/posthog";
import { useTranslations, useLocale } from "next-intl";

function formatDate(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { day: "numeric", month: "short" });
}

type DashboardProps = {
  metrics: AggregatedMetrics;
};

export function Dashboard({ metrics }: DashboardProps) {
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const t = useTranslations();
  const locale = useLocale();

  const allSelected = selectedProjects.length === 0;
  const topProjects = metrics.topProjects ?? [];

  const filteredProjects: ProjectStats[] = allSelected
    ? topProjects
    : topProjects.filter((p) => selectedProjects.includes(p.name));

  const kpiPageviews = allSelected
    ? (metrics.recentPageviews ?? 0)
    : filteredProjects.reduce((s, p) => s + p.pageviews, 0);
  const kpiVisitors = allSelected
    ? (metrics.recentVisitors ?? 0)
    : filteredProjects.reduce((s, p) => s + p.visitors, 0);
  const kpiSessions = allSelected
    ? (metrics.recentSessions ?? 0)
    : filteredProjects.reduce((s, p) => s + p.sessions, 0);

  const pageviewsTrend = allSelected
    ? (metrics.pageviewsTrend ?? [])
    : filteredProjects.reduce<{ date: string; value: number }[]>((acc, p) => {
        const map = new Map(acc.map((d) => [d.date, d.value]));
        for (const pt of p.pvTrend) map.set(pt.date, (map.get(pt.date) ?? 0) + pt.value);
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
      }, []);

  const sessionsTrend = allSelected
    ? (metrics.sessionsTrend ?? [])
    : filteredProjects.reduce<{ date: string; value: number }[]>((acc, p) => {
        const map = new Map(acc.map((d) => [d.date, d.value]));
        for (const pt of p.sessTrend) map.set(pt.date, (map.get(pt.date) ?? 0) + pt.value);
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
      }, []);

  const visitorsTrend = allSelected
    ? (metrics.visitorsTrend ?? [])
    : filteredProjects.reduce<{ date: string; value: number }[]>((acc, p) => {
        const map = new Map(acc.map((d) => [d.date, d.value]));
        for (const pt of p.visTrend) map.set(pt.date, (map.get(pt.date) ?? 0) + pt.value);
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
      }, []);

  const pvChartConfig = {
    value: { label: t("kpi.pageviews"), color: "var(--color-chart-1)" },
  } satisfies ChartConfig;

  const sessChartConfig = {
    value: { label: t("kpi.sessions"), color: "var(--color-chart-2)" },
  } satisfies ChartConfig;

  const visChartConfig = {
    value: { label: t("dashboard.visitorsChart"), color: "var(--color-chart-3)" },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-8">
      {/* Filter bar */}
      <div className="flex items-center gap-4">
        <ProjectFilter
          projects={topProjects}
          selected={selectedProjects}
          onChange={setSelectedProjects}
        />
        {!allSelected && (
          <span className="text-sm text-muted-foreground">
            {selectedProjects.length === 1
              ? t("dashboard.projectsSelected", { count: selectedProjects.length })
              : t("dashboard.projectsSelectedPlural", { count: selectedProjects.length })}
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("kpi.pageviews")}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {kpiPageviews.toLocaleString("en-US")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{allSelected ? t("kpi.last3Days") : t("kpi.last30Days")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("kpi.uniqueVisitors")}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {kpiVisitors.toLocaleString("en-US")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{allSelected ? t("kpi.last3Days") : t("kpi.last30Days")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("kpi.sessions")}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {kpiSessions.toLocaleString("en-US")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{allSelected ? t("kpi.last3Days") : t("kpi.last30Days")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Projects */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.topProjects")}</CardTitle>
          <CardDescription>
            {t("dashboard.topProjectsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              {t("dashboard.noProjectData")}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((p) => {
                const max = filteredProjects[0].pageviews;
                const pct = max > 0 ? (p.pageviews / max) * 100 : 0;
                return (
                  <div key={p.name}>
                    <div className="mb-1">
                      <span className="text-sm font-medium inline-flex items-center gap-1.5">
                        <span
                          className="inline-block size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        {p.url ? (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {p.name}
                          </a>
                        ) : (
                          p.name
                        )}
                      </span>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-0.5 ml-4">
                        <span>{p.pageviews.toLocaleString()} {t("dashboard.views")}</span>
                        <span>{p.sessions.toLocaleString()} {t("dashboard.sessionsLabel")}</span>
                        <span>{p.visitors.toLocaleString()} {t("dashboard.visitors")}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: p.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TrendChart
          title={t("dashboard.pageviewsChart")}
          description={t("dashboard.pageviewsChartDescription")}
          data={pageviewsTrend}
          config={pvChartConfig}
          noDataLabel={t("dashboard.noData")}
          locale={locale}
        />
        <TrendChart
          title={t("dashboard.sessionsChart")}
          description={t("dashboard.sessionsChartDescription")}
          data={sessionsTrend}
          config={sessChartConfig}
          noDataLabel={t("dashboard.noData")}
          locale={locale}
        />
        <TrendChart
          title={t("dashboard.visitorsChart")}
          description={t("dashboard.visitorsChartDescription")}
          data={visitorsTrend}
          config={visChartConfig}
          noDataLabel={t("dashboard.noData")}
          locale={locale}
        />
      </div>
    </div>
  );
}

function TrendChart({
  title,
  description,
  data,
  config,
  noDataLabel,
  locale,
}: {
  title: string;
  description: string;
  data: { date: string; value: number }[];
  config: ChartConfig;
  noDataLabel: string;
  locale: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            {noDataLabel}
          </div>
        ) : (
          <ChartContainer config={config} className="h-[200px] w-full">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`fill-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => formatDate(v, locale)}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                }
                width={40}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => formatDate(String(label), locale)}
                  />
                }
              />
              <Area
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                fill={`url(#fill-${title})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
