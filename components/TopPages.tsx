type TopPagesProps = {
  pages: { url: string; count: number }[];
};

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname + (u.search ? u.search : "");
    return path.length > 60 ? path.slice(0, 57) + "…" : path || "/";
  } catch {
    return url.length > 60 ? url.slice(0, 57) + "…" : url;
  }
}

export function TopPages({ pages }: TopPagesProps) {
  if (!pages || pages.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4">No page data available.</p>
    );
  }

  const max = Math.max(...pages.map((p) => p.count), 1);

  return (
    <div className="flex flex-col gap-2">
      {pages.map((page, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-4 shrink-0 text-right">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-xs font-mono text-gray-700 truncate max-w-[200px]"
                title={page.url}
              >
                {shortenUrl(page.url)}
              </span>
              <span className="text-xs font-semibold text-gray-600 ml-2 shrink-0">
                {page.count.toLocaleString("en-US")}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-400"
                style={{ width: `${(page.count / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
