const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://us.posthog.com";
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY!;

export type ProjectConfig = {
  id: number;
  name: string;
  orgName: string;
  token: string;
};

export const PROJECTS: ProjectConfig[] = [
  {
    id: 46842,
    name: "Planify",
    orgName: "Nexans Biz Holding",
    token: "phc_NNRUyC7CBDfr8iFffRYL0njEqOL28SDrm5ydLnFiEIw",
  },
  {
    id: 87013,
    name: "Default",
    orgName: "Personal",
    token: "phc_V86sv23tZmpoIKoMxp8E9nd3w3BxMM5vw5GYtZlOXrY",
  },
];

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

export type ProjectMetrics = {
  projectId: number;
  projectName: string;
  orgName: string;
  pageviews: number;
  uniqueVisitors: number;
  sessions: number;
  pageviewsTrend: { date: string; value: number }[];
  topPages: { url: string; count: number }[];
  fetchedAt: string;
};

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

export async function fetchProjectMetrics(
  project: ProjectConfig
): Promise<ProjectMetrics> {
  const { date_from, date_to } = getDateRange();

  const [pvResult, uvResult, sessResult, trendResult, topPagesResult] =
    await Promise.allSettled([
      // Total pageviews
      queryHogQL(
        project.id,
        `SELECT count() FROM events
         WHERE event = '$pageview'
           AND timestamp >= '${date_from}'
           AND timestamp <= '${date_to}'`
      ),
      // Unique visitors (distinct_id)
      queryHogQL(
        project.id,
        `SELECT count(DISTINCT distinct_id) FROM events
         WHERE event = '$pageview'
           AND timestamp >= '${date_from}'
           AND timestamp <= '${date_to}'`
      ),
      // Unique sessions
      queryHogQL(
        project.id,
        `SELECT count(DISTINCT properties.$session_id) FROM events
         WHERE event = '$pageview'
           AND timestamp >= '${date_from}'
           AND timestamp <= '${date_to}'
           AND properties.$session_id IS NOT NULL`
      ),
      // Daily pageviews trend
      queryHogQL(
        project.id,
        `SELECT toDate(timestamp) as day, count() as cnt
         FROM events
         WHERE event = '$pageview'
           AND timestamp >= '${date_from}'
           AND timestamp <= '${date_to}'
         GROUP BY day
         ORDER BY day ASC`
      ),
      // Top pages
      queryHogQL(
        project.id,
        `SELECT properties.$current_url as url, count() as cnt
         FROM events
         WHERE event = '$pageview'
           AND timestamp >= '${date_from}'
           AND timestamp <= '${date_to}'
           AND properties.$current_url IS NOT NULL
         GROUP BY url
         ORDER BY cnt DESC
         LIMIT 10`
      ),
    ]);

  const pageviews =
    pvResult.status === "fulfilled"
      ? (pvResult.value?.results?.[0]?.[0] ?? 0)
      : 0;

  const uniqueVisitors =
    uvResult.status === "fulfilled"
      ? (uvResult.value?.results?.[0]?.[0] ?? 0)
      : 0;

  const sessions =
    sessResult.status === "fulfilled"
      ? (sessResult.value?.results?.[0]?.[0] ?? 0)
      : 0;

  const pageviewsTrend: { date: string; value: number }[] =
    trendResult.status === "fulfilled"
      ? (trendResult.value?.results ?? []).map(
          ([day, cnt]: [string, number]) => ({ date: day, value: cnt })
        )
      : [];

  const topPages: { url: string; count: number }[] =
    topPagesResult.status === "fulfilled"
      ? (topPagesResult.value?.results ?? []).map(
          ([url, cnt]: [string, number]) => ({ url, count: cnt })
        )
      : [];

  return {
    projectId: project.id,
    projectName: project.name,
    orgName: project.orgName,
    pageviews,
    uniqueVisitors,
    sessions,
    pageviewsTrend,
    topPages,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchAllMetrics(): Promise<ProjectMetrics[]> {
  const results = await Promise.allSettled(
    PROJECTS.map((p) => fetchProjectMetrics(p))
  );
  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<ProjectMetrics>).value);
}
