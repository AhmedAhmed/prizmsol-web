import PaneHeader from "@/components/PaneHeader";
import { UsageChart } from "@/components/usage/usage-chart";

export default function UsagePage() {
  return (
    <div className="flex flex-1 flex-col">
      <PaneHeader>
        <div className="flex flex-1 items-center justify-between">
          <h2 className="text-sm font-bold">AI Credit Usage</h2>
        </div>
      </PaneHeader>
      <div className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-8">
        <UsageChart />
      </div>
    </div>
  );
}
