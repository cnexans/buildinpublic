const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://us.posthog.com";
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY!;

// Project IDs are configured via env var as comma-separated values, e.g. "46842,87013"
const POSTHOG_PROJECT_IDS = (process.env.POSTHOG_PROJECT_IDS || "")
  .split(",")
  .map((id) => parseInt(id.trim(), 10))
  .filter((id) => !isNaN(id));

// Map domains to projects via regex patterns.
// First match wins. Unmatched non-empty domains go to "Otros".
// Private projects (private: true) count in totals but show masked name in the list.
export type ProjectMapping = {
  name: string;
  url?: string;
  patterns: RegExp[];
  private?: boolean;
  color: string;
};

export const PROJECT_MAPPINGS: ProjectMapping[] = [
  {
    name: "Mana",
    url: "https://mana.planify.la",
    patterns: [/^mana\.planify\.la$/],
    color: "#8B5CF6",
  },
  {
    name: "Planify",
    url: "https://planify.la",
    patterns: [/planify/i],
    color: "#2563EB",
  },
  {
    name: "Impuestito",
    url: "https://impuesti.to",
    patterns: [/gananciasfacil/i, /impuesti\.to/i],
    color: "#059669",
  },
  {
    name: "PanaUber",
    url: "https://panauber.vercel.app",
    patterns: [/panauber/i],
    color: "#D97706",
  },
  // Private domains configured via PRIVATE_DOMAIN_PATTERNS env var
  // (comma-separated patterns, e.g. "myapp,secret-project")
  ...(process.env.PRIVATE_DOMAIN_PATTERNS
    ? [
        {
          name: "Apps de particulares",
          private: true,
          patterns: process.env.PRIVATE_DOMAIN_PATTERNS.split(",").map(
            (p) => new RegExp(p.trim(), "i")
          ),
          color: "#DC2626",
        },
      ]
    : []),
  {
    name: "Mi Libro de Matemática",
    url: "https://codex.cnexans.com",
    patterns: [/codex/i],
    color: "#0891B2",
  },
  {
    name: "Mi sitio web",
    url: "https://cnexans.com",
    patterns: [/cnexans\.com$/, /carlosnexans/i, /home-kohl/i],
    color: "#DB2777",
  },
];

export type DailyPoint = { date: string; value: number };

export type ProjectStats = {
  name: string;
  url?: string;
  private?: boolean;
  color: string;
  pageviews: number;
  sessions: number;
  visitors: number;
  domains: string[];
};

export type AggregatedMetrics = {
  totalPageviews: number;
  totalSessions: number;
  totalVisitors: number;
  recentPageviews: number;
  recentSessions: number;
  recentVisitors: number;
  pageviewsTrend: DailyPoint[];
  sessionsTrend: DailyPoint[];
  visitorsTrend: DailyPoint[];
  topProjects: ProjectStats[];
  allProjects: string[];
  fetchedAt: string;
};

async function posthogFetch(path: string, options?: RequestInit) {
  const url = `${POSTHOG_HOST}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${POSTHOG_API_KEY}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`PostHog API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

function getDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    date_from: from.toISOString().split("T")[0],
    date_to: to.toISOString().split("T")[0],
  };
}

async function queryHogQL(projectId: number, query: string) {
  return posthogFetch(`/api/projects/${projectId}/query`, {
    method: "POST",
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query,
      },
    }),
  });
}

type DomainStats = {
  domain: string;
  pageviews: number;
  sessions: number;
  visitors: number;
};

type RawRow = [string, number];
type RawDomainRow = [string, number, number, number];

async function fetchProjectData(projectId: number) {
  const { date_from, date_to } = getDateRange();

  const [
    pvTrendResult,
    sessTrendResult,
    visTrendResult,
    domainResult,
  ] = await Promise.allSettled([
    // Daily pageviews
    queryHogQL(
      projectId,
      `SELECT toDate(timestamp) as day, count() as cnt
       FROM events
       WHERE event = '$pageview'
         AND timestamp >= '${date_from}'
         AND timestamp <= '${date_to}'
       GROUP BY day
       ORDER BY day ASC`
    ),
    // Daily sessions
    queryHogQL(
      projectId,
      `SELECT toDate(timestamp) as day, count(DISTINCT properties.$session_id) as cnt
       FROM events
       WHERE event = '$pageview'
         AND timestamp >= '${date_from}'
         AND timestamp <= '${date_to}'
         AND properties.$session_id IS NOT NULL
       GROUP BY day
       ORDER BY day ASC`
    ),
    // Daily unique visitors
    queryHogQL(
      projectId,
      `SELECT toDate(timestamp) as day, count(DISTINCT distinct_id) as cnt
       FROM events
       WHERE event = '$pageview'
         AND timestamp >= '${date_from}'
         AND timestamp <= '${date_to}'
       GROUP BY day
       ORDER BY day ASC`
    ),
    // Domain stats (pageviews, sessions, visitors per domain)
    queryHogQL(
      projectId,
      `SELECT
         domain(properties.$current_url) as dom,
         count() as pvs,
         count(DISTINCT properties.$session_id) as sess,
         count(DISTINCT distinct_id) as vis
       FROM events
       WHERE event = '$pageview'
         AND timestamp >= '${date_from}'
         AND timestamp <= '${date_to}'
         AND properties.$current_url IS NOT NULL
       GROUP BY dom
       ORDER BY pvs DESC
       LIMIT 50`
    ),
  ]);

  const pvTrend: DailyPoint[] =
    pvTrendResult.status === "fulfilled"
      ? (pvTrendResult.value?.results ?? []).map(([day, cnt]: RawRow) => ({
          date: day,
          value: cnt,
        }))
      : [];

  const sessTrend: DailyPoint[] =
    sessTrendResult.status === "fulfilled"
      ? (sessTrendResult.value?.results ?? []).map(([day, cnt]: RawRow) => ({
          date: day,
          value: cnt,
        }))
      : [];

  const visTrend: DailyPoint[] =
    visTrendResult.status === "fulfilled"
      ? (visTrendResult.value?.results ?? []).map(([day, cnt]: RawRow) => ({
          date: day,
          value: cnt,
        }))
      : [];

  const domains: DomainStats[] =
    domainResult.status === "fulfilled"
      ? (domainResult.value?.results ?? []).map(
          ([dom, pvs, sess, vis]: RawDomainRow) => ({
            domain: dom,
            pageviews: pvs,
            sessions: sess,
            visitors: vis,
          })
        )
      : [];

  return { pvTrend, sessTrend, visTrend, domains };
}

function mergeTrends(
  ...trendArrays: DailyPoint[][]
): DailyPoint[] {
  const map = new Map<string, number>();
  for (const trends of trendArrays) {
    for (const point of trends) {
      map.set(point.date, (map.get(point.date) ?? 0) + point.value);
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

function mergeDomains(...domainArrays: DomainStats[][]): DomainStats[] {
  const map = new Map<string, DomainStats>();
  for (const domains of domainArrays) {
    for (const d of domains) {
      if (!d.domain || d.domain.trim() === "") continue;
      const existing = map.get(d.domain);
      if (existing) {
        existing.pageviews += d.pageviews;
        existing.sessions += d.sessions;
        existing.visitors += d.visitors;
      } else {
        map.set(d.domain, { ...d });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.pageviews - a.pageviews);
}

function resolveProject(domain: string): ProjectMapping | null {
  for (const mapping of PROJECT_MAPPINGS) {
    if (mapping.patterns.some((p) => p.test(domain))) {
      return mapping;
    }
  }
  return null;
}

function groupDomainsIntoProjects(domains: DomainStats[]): ProjectStats[] {
  const map = new Map<string, ProjectStats>();

  for (const d of domains) {
    const mapping = resolveProject(d.domain);
    const name = mapping?.name ?? d.domain;

    const existing = map.get(name);
    if (existing) {
      existing.pageviews += d.pageviews;
      existing.sessions += d.sessions;
      existing.visitors += d.visitors;
      if (!existing.domains.includes(d.domain)) {
        existing.domains.push(d.domain);
      }
    } else {
      map.set(name, {
        name,
        url: mapping?.url,
        private: mapping?.private,
        color: mapping?.color ?? "#6B7280",
        pageviews: d.pageviews,
        sessions: d.sessions,
        visitors: d.visitors,
        domains: [d.domain],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.pageviews - a.pageviews);
}

export async function fetchAggregatedMetrics(): Promise<AggregatedMetrics> {
  const results = await Promise.allSettled(
    POSTHOG_PROJECT_IDS.map((id) => fetchProjectData(id))
  );

  const fulfilled = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof fetchProjectData>>>).value);

  const pageviewsTrend = mergeTrends(...fulfilled.map((f) => f.pvTrend));
  const sessionsTrend = mergeTrends(...fulfilled.map((f) => f.sessTrend));
  const visitorsTrend = mergeTrends(...fulfilled.map((f) => f.visTrend));
  const allDomains = mergeDomains(...fulfilled.map((f) => f.domains));
  const topProjects = groupDomainsIntoProjects(allDomains);

  const totalPageviews = topProjects.reduce((s, p) => s + p.pageviews, 0);
  const totalSessions = topProjects.reduce((s, p) => s + p.sessions, 0);
  const totalVisitors = topProjects.reduce((s, p) => s + p.visitors, 0);

  // Last 3 days totals from trends
  const sumLast3 = (trend: DailyPoint[]) =>
    trend.slice(-3).reduce((s, p) => s + p.value, 0);

  const recentPageviews = sumLast3(pageviewsTrend);
  const recentSessions = sumLast3(sessionsTrend);
  const recentVisitors = sumLast3(visitorsTrend);

  const allProjectNames = topProjects.map((p) => p.name);

  return {
    totalPageviews,
    totalSessions,
    totalVisitors,
    recentPageviews,
    recentSessions,
    recentVisitors,
    pageviewsTrend,
    sessionsTrend,
    visitorsTrend,
    topProjects,
    allProjects: allProjectNames,
    fetchedAt: new Date().toISOString(),
  };
}
