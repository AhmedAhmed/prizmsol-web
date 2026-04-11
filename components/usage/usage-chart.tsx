"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getUsageDataAction } from "@/app/actions/billing";
import { Button } from "@/components/ui/button";

type ViewType = "daily" | "weekly" | "monthly" | "yearly";

type UsagePayload = {
  view: ViewType;
  points: Array<{ label: string; amount: number }>;
  totalUsed: number;
  limit: number;
  remaining: number;
  plan: string;
};

const views: ViewType[] = ["daily", "weekly", "monthly", "yearly"];

export function UsageChart() {
  const [view, setView] = useState<ViewType>("monthly");
  const [data, setData] = useState<UsagePayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const payload = (await getUsageDataAction(view)) as UsagePayload;
      setData(payload);
      setLoading(false);
    };
    run();
  }, [view]);

  const used = data?.totalUsed ?? 0;
  const limit = data?.limit ?? 0;
  const percentUsed = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const cumulativePoints = (data?.points ?? []).reduce<Array<{ label: string; amount: number; cumulative: number }>>(
    (acc, point) => {
      const previous = acc[acc.length - 1]?.cumulative ?? 0;
      acc.push({
        ...point,
        cumulative: Number((previous + point.amount).toFixed(2)),
      });
      return acc;
    },
    []
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {views.map((item) => (
            <Button
              key={item}
              onClick={() => setView(item)}
              size="sm"
              variant={item === view ? "default" : "outline"}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </Button>
          ))}
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {data?.plan?.toUpperCase() ?? "FREE"}
          </span>{" "}
          plan
        </div>
      </div>

      <div className="flex w-full gap-3 overflow-x-auto">
        <div className="min-w-[180px] flex-1 rounded-lg border dark:border-neutral-800 p-4">
          <p className="text-xs text-neutral-500">Used</p>
          <p className="text-xl font-semibold">${(data?.totalUsed ?? 0).toFixed(2)}</p>
        </div>
        <div className="min-w-[180px] flex-1 rounded-lg border dark:border-neutral-800  p-4">
          <p className="text-xs text-neutral-500">Limit</p>
          <p className="text-xl font-semibold">${(data?.limit ?? 0).toFixed(2)}</p>
        </div>
        <div className="min-w-[180px] flex-1 rounded-lg border dark:border-neutral-800  p-4">
          <p className="text-xs text-neutral-500">Remaining</p>
          <p className="text-xl font-semibold">${Math.max(0, data?.remaining ?? 0).toFixed(2)}</p>
        </div>
        <div className="min-w-[180px] flex-1 rounded-lg border dark:border-neutral-800  p-4">
          <p className="text-xs text-neutral-500">% Used</p>
          <p className="text-xl font-semibold">{percentUsed.toFixed(1)}%</p>
        </div>
      </div>

      <div className="w-full rounded-lg border dark:border-neutral-800  p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
          <span>Credit usage</span>
          <span>{percentUsed.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      <div className="h-[360px] w-full rounded-xl border dark:border-neutral-800  p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            Loading usage...
          </div>
        ) : cumulativePoints.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            No usage in this time range yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativePoints}>
              <defs>
                <linearGradient id="usageSpendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#737373" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => `$${Number(value).toFixed(0)}`} />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#usageSpendFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
