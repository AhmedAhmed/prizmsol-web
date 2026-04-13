import PaneHeader from "@/components/PaneHeader";

export default function SourcesLayout({ children }: { children: React.ReactNode; }) {
    return (
        <div className="flex flex-col">
            <PaneHeader>
                <h1 className="text-sm font-bold">Sources</h1>
            </PaneHeader>
            {children}
        </div>
    );
}
