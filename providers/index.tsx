import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import NProgressProvider from "./nprogress-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NProgressProvider>
      <TooltipProvider>
          <ThemeProvider
              attribute="class"
              enableSystem
              disableTransitionOnChange
          >
                  {children}
          </ThemeProvider>
      </TooltipProvider>
    </NProgressProvider>
  );
}