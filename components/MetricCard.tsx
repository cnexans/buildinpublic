type MetricCardProps = {
  label: string;
  value: number | string;
  icon: string;
  description?: string;
};

export function MetricCard({ label, value, icon, description }: MetricCardProps) {
  const formatted =
    typeof value === "number" ? value.toLocaleString("en-US") : value;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-4xl font-bold text-gray-900 tabular-nums">{formatted}</p>
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}
    </div>
  );
}
