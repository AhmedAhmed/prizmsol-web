import Sidebar from "@/components/sidebar";

export default async function AppLayout({ children }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col flex-1">
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex flex-col flex-1 bg-neutral-100 dark:bg-black justify-center gap-2 p-2 pl-0">
                    <div className="flex flex-col h-[calc(100vh-20px)] overflow-hidden overflow-y-auto relative w-full bg-neutral-50 dark:bg-neutral-950 border-[0.5px] border-neutral-300 dark:border-neutral-800 rounded-md">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
