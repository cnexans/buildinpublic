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

const pvChartConfig = {
  value: { label: "Pageviews", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

const sessChartConfig = {
  value: { label: "Sesiones", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

const visChartConfig = {
  value: { label: "Visitantes", color: "var(--color-chart-3)" },
} satisfies ChartConfig;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

type DashboardProps = {
  metrics: AggregatedMetrics;
};

export function Dashboard({ metrics }: DashboardProps) {
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);

  const allSelected = selectedProjects.length === 0;
  const topProjects = metrics.topProjects ?? [];

  const filteredProjects: ProjectStats[] = allSelected
    ? topProjects
    : topProjects.filter((p) => selectedProjects.includes(p.name));

  const pageviewsTrend = metrics.pageviewsTrend ?? [];
  const sessionsTrend = metrics.sessionsTrend ?? [];
  const visitorsTrend = metrics.visitorsTrend ?? [];

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
            {selectedProjects.length} proyecto{selectedProjects.length !== 1 ? "s" : ""} seleccionado{selectedProjects.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* KPI Cards — últimos 3 días */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pageviews</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {(metrics.recentPageviews ?? 0).toLocaleString("en-US")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Últimos 3 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visitantes Únicos</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {(metrics.recentVisitors ?? 0).toLocaleString("en-US")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Últimos 3 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sesiones</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {(metrics.recentSessions ?? 0).toLocaleString("en-US")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Últimos 3 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Top Proyectos</CardTitle>
          <CardDescription>
            Tráfico en los últimos 30 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No hay datos de proyectos disponibles.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((p, i) => {
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
                        <span>{p.pageviews.toLocaleString()} vistas</span>
                        <span>{p.sessions.toLocaleString()} sesiones</span>
                        <span>{p.visitors.toLocaleString()} visitas</span>
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
          title="Pageviews"
          description="Pageviews diarios (30 días)"
          data={pageviewsTrend}
          config={pvChartConfig}
        />
        <TrendChart
          title="Sesiones"
          description="Sesiones diarias (30 días)"
          data={sessionsTrend}
          config={sessChartConfig}
        />
        <TrendChart
          title="Visitantes"
          description="Visitantes únicos diarios (30 días)"
          data={visitorsTrend}
          config={visChartConfig}
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
}: {
  title: string;
  description: string;
  data: { date: string; value: number }[];
  config: ChartConfig;
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
            Sin datos
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
                tickFormatter={formatDate}
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
                    labelFormatter={(label) => formatDate(String(label))}
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
