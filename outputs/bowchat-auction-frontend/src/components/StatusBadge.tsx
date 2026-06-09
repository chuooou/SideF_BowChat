interface StatusBadgeProps {
  tone?: "neutral" | "good" | "warn" | "danger";
  children: string;
}

const tones = {
  neutral: "border-line bg-slate-50 text-slate-600",
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
};

export function StatusBadge({ tone = "neutral", children }: StatusBadgeProps) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
