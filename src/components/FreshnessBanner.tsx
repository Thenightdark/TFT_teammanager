import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import type { SetInfo } from "../types/Set";

interface FreshnessBannerProps { set: SetInfo; compPatch?: string; }

export default function FreshnessBanner({ set, compPatch }: FreshnessBannerProps) {
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const freshness = useMemo(() => {
    if (!set.metaUpdatedAt) return { label: "Update date unavailable", tone: "unknown" };
    const age = Math.max(0, Math.floor((Date.now() - new Date(`${set.metaUpdatedAt}T00:00:00`).getTime()) / 86400000));
    return age <= 14 ? { label: `Updated ${age} day${age === 1 ? "" : "s"} ago`, tone: "fresh" } : { label: `Data is ${age} days old`, tone: "stale" };
  }, [set.metaUpdatedAt, checkedAt]);
  return <div className={`freshness-banner ${freshness.tone}`} role="status"><span><i /> <strong>{freshness.label}</strong><small>{compPatch ?? set.patch} · {set.name}</small></span><button type="button" onClick={() => setCheckedAt(new Date())}><RefreshCw size={14} /> Check freshness</button>{checkedAt && <small>Checked {checkedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Install a newly built app when a newer data package is available.</small>}</div>;
}
