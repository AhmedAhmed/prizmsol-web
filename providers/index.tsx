import PlayerProvider from "./player-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import NProgressProvider from "./nprogress-provider";
import { NextAuthProvider } from "./next-auth-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
        <PlayerProvider>
            <TooltipProvider>
                <NProgressProvider>
                    <ThemeProvider
                        attribute="class"
                        enableSystem
                        disableTransitionOnChange
                    >
                            {children}
                    </ThemeProvider>
                </NProgressProvider>
            </TooltipProvider>
        </PlayerProvider>
    </NextAuthProvider>    
  );
}