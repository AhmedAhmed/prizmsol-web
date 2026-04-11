"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(auth)/auth";
import { getUserAiCreditUsageEvents, getUserAiCreditUsageTotal } from "@/lib/db/queries";
import {
  getCreditLimitCents,
  getCurrentUsageWindow,
  reconcileUserPlanStatus,
} from "@/lib/stripe/billing";

type ViewType = "daily" | "weekly" | "monthly" | "yearly";

function getRangeStart(now: Date, view: ViewType) {
  const start = new Date(now);
  if (view === "daily") start.setDate(start.getDate() - 1);
  if (view === "weekly") start.setDate(start.getDate() - 7);
  if (view === "monthly") start.setMonth(start.getMonth() - 1);
  if (view === "yearly") start.setFullYear(start.getFullYear() - 1);
  return start;
}

function bucketKey(date: Date, view: ViewType) {
  if (view === "daily") return `${date.getHours()}:00`;
  if (view === "weekly" || view === "monthly") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export async function getAccountSnapshotAction() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { plan: "free", totalUsed: 0, limit: 0, remaining: 0, isAuthenticated: false };
  }

  const user = await reconcileUserPlanStatus(session.user.id);
  const cycleWindow = getCurrentUsageWindow({
    billingPeriodStart: user?.billingPeriodStart,
    billingPeriodEnd: user?.billingPeriodEnd,
  });
  const usedInCycleCents = await getUserAiCreditUsageTotal({
    userId: session.user.id,
    from: cycleWindow.from,
    to: cycleWindow.to,
  });
  const limitCents = getCreditLimitCents((user?.plan ?? "free") as "free" | "pro" | "plus");

  return {
    plan: user?.plan ?? "free",
    totalUsed: Number((usedInCycleCents / 100).toFixed(2)),
    limit: Number((limitCents / 100).toFixed(2)),
    remaining: Number(((limitCents - usedInCycleCents) / 100).toFixed(2)),
    isAuthenticated: true,
  };
}

export async function getUsageDataAction(view: ViewType = "monthly") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      view,
      points: [] as Array<{ label: string; amount: number }>,
      totalUsed: 0,
      limit: 0,
      remaining: 0,
      plan: "free",
      isAuthenticated: false,
    };
  }

  const now = new Date();
  const user = await reconcileUserPlanStatus(session.user.id);
  const cycleWindow = getCurrentUsageWindow({
    billingPeriodStart: user?.billingPeriodStart,
    billingPeriodEnd: user?.billingPeriodEnd,
  });
  const viewStart = getRangeStart(now, view);
  const from = viewStart > cycleWindow.from ? viewStart : cycleWindow.from;
  const to = now < cycleWindow.to ? now : cycleWindow.to;

  const events = await getUserAiCreditUsageEvents({
    userId: session.user.id,
    from,
    to,
  });
  const usedInCycleCents = await getUserAiCreditUsageTotal({
    userId: session.user.id,
    from: cycleWindow.from,
    to: cycleWindow.to,
  });

  const pointsMap = new Map<string, number>();
  for (const event of events) {
    const key = bucketKey(new Date(event.createdAt), view);
    pointsMap.set(key, (pointsMap.get(key) ?? 0) + event.amountCents);
  }

  const points = Array.from(pointsMap.entries()).map(([label, amountCents]) => ({
    label,
    amount: Number((amountCents / 100).toFixed(2)),
  }));

  const limitCents = getCreditLimitCents((user?.plan ?? "free") as "free" | "pro" | "plus");

  return {
    view,
    points,
    totalUsed: Number((usedInCycleCents / 100).toFixed(2)),
    limit: Number((limitCents / 100).toFixed(2)),
    remaining: Number(((limitCents - usedInCycleCents) / 100).toFixed(2)),
    plan: user?.plan ?? "free",
    isAuthenticated: true,
  };
}
