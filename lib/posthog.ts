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
  pvTrend: DailyPoint[];
  sessTrend: DailyPoint[];
  visTrend: DailyPoint[];
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

type RawDomainDailyRow = [string, string, number, number, number]; // day, domain, pvs, sess, vis

async function fetchProjectData(projectId: number) {
  const { date_from, date_to } = getDateRange();

  // Single query: daily stats per domain — derives both totals and trends
  const result = await queryHogQL(
    projectId,
    `SELECT
       toDate(timestamp) as day,
       domain(properties.$current_url) as dom,
       count() as pvs,
       count(DISTINCT properties.$session_id) as sess,
       count(DISTINCT distinct_id) as vis
     FROM events
     WHERE event = '$pageview'
       AND timestamp >= '${date_from}'
       AND timestamp <= '${date_to}'
       AND properties.$current_url IS NOT NULL
     GROUP BY day, dom
     ORDER BY day ASC`
  );

  const rows: RawDomainDailyRow[] = result?.results ?? [];
  return { rows };
}

function addToTrendMap(map: Map<string, number>, date: string, value: number) {
  map.set(date, (map.get(date) ?? 0) + value);
}

function trendMapToPoints(map: Map<string, number>): DailyPoint[] {
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

function resolveProject(domain: string): ProjectMapping | null {
  for (const mapping of PROJECT_MAPPINGS) {
    if (mapping.patterns.some((p) => p.test(domain))) {
      return mapping;
    }
  }
  return null;
}

type ProjectAccumulator = {
  name: string;
  url?: string;
  private?: boolean;
  color: string;
  pageviews: number;
  sessions: number;
  visitors: number;
  domains: string[];
  pvMap: Map<string, number>;
  sessMap: Map<string, number>;
  visMap: Map<string, number>;
};

function processAllRows(allRows: RawDomainDailyRow[]): {
  projects: ProjectStats[];
  pageviewsTrend: DailyPoint[];
  sessionsTrend: DailyPoint[];
  visitorsTrend: DailyPoint[];
} {
  const projectMap = new Map<string, ProjectAccumulator>();
  const globalPvMap = new Map<string, number>();
  const globalSessMap = new Map<string, number>();
  const globalVisMap = new Map<string, number>();

  for (const [day, dom, pvs, sess, vis] of allRows) {
    if (!dom || dom.trim() === "") continue;

    const mapping = resolveProject(dom);
    const name = mapping?.name ?? dom;

    // Global trends
    addToTrendMap(globalPvMap, day, pvs);
    addToTrendMap(globalSessMap, day, sess);
    addToTrendMap(globalVisMap, day, vis);

    // Per-project accumulation
    const existing = projectMap.get(name);
    if (existing) {
      existing.pageviews += pvs;
      existing.sessions += sess;
      existing.visitors += vis;
      if (!existing.domains.includes(dom)) existing.domains.push(dom);
      addToTrendMap(existing.pvMap, day, pvs);
      addToTrendMap(existing.sessMap, day, sess);
      addToTrendMap(existing.visMap, day, vis);
    } else {
      const pvMap = new Map<string, number>();
      const sessMap = new Map<string, number>();
      const visMap = new Map<string, number>();
      addToTrendMap(pvMap, day, pvs);
      addToTrendMap(sessMap, day, sess);
      addToTrendMap(visMap, day, vis);
      projectMap.set(name, {
        name,
        url: mapping?.url,
        private: mapping?.private,
        color: mapping?.color ?? "#6B7280",
        pageviews: pvs,
        sessions: sess,
        visitors: vis,
        domains: [dom],
        pvMap,
        sessMap,
        visMap,
      });
    }
  }

  const projects: ProjectStats[] = Array.from(projectMap.values())
    .sort((a, b) => b.pageviews - a.pageviews)
    .map(({ pvMap, sessMap, visMap, ...rest }) => ({
      ...rest,
      pvTrend: trendMapToPoints(pvMap),
      sessTrend: trendMapToPoints(sessMap),
      visTrend: trendMapToPoints(visMap),
    }));

  return {
    projects,
    pageviewsTrend: trendMapToPoints(globalPvMap),
    sessionsTrend: trendMapToPoints(globalSessMap),
    visitorsTrend: trendMapToPoints(globalVisMap),
  };
}

export async function fetchAggregatedMetrics(): Promise<AggregatedMetrics> {
  const results = await Promise.allSettled(
    POSTHOG_PROJECT_IDS.map((id) => fetchProjectData(id))
  );

  const allRows: RawDomainDailyRow[] = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof fetchProjectData>>>).value.rows);

  const { projects: topProjects, pageviewsTrend, sessionsTrend, visitorsTrend } = processAllRows(allRows);

  const totalPageviews = topProjects.reduce((s, p) => s + p.pageviews, 0);
  const totalSessions = topProjects.reduce((s, p) => s + p.sessions, 0);
  const totalVisitors = topProjects.reduce((s, p) => s + p.visitors, 0);

  const sumLast3 = (trend: DailyPoint[]) =>
    trend.slice(-3).reduce((s, p) => s + p.value, 0);

  const recentPageviews = sumLast3(pageviewsTrend);
  const recentSessions = sumLast3(sessionsTrend);
  const recentVisitors = sumLast3(visitorsTrend);

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
    allProjects: topProjects.map((p) => p.name),
    fetchedAt: new Date().toISOString(),
  };
}
