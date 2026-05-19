import { Source } from "@/lib/db/schema";
import SourceSidebar from "./source-sidebar";
import SourcesFilter from "./sources-filter";

export default function SourcesLayout({
    sources,
    children,
}: {
    sources: Source[];
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col flex-1">
            <div className="flex flex-1">
                <div className="flex-1 flex flex-col min-w-0">
                    <SourcesFilter />
                    <div className="flex-1 p-6 w-full">
                        {children}
                    </div>
                </div>
                <SourceSidebar sources={sources} />
            </div>
        </div>
    );
}
