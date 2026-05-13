import Link from "next/link";

export default function AgentItem({
    title,
    description,
    href = "/agents",
    training = false,
    trained = false,
}: {
    title: string;
    description: string;
    href?: string;
    trained?: boolean;
    training?: boolean;
}) {
    const renderStatus = () => {
        if (trained) {
            return (
                <div className="flex items-center gap-2">
                    <div className="flex w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full"></div>
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">Trained</span>
                </div>
            );
        } else if (training) {
            return (
                <div className="flex items-center gap-2">
                    <div className="flex w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full"></div>
                    <span className="text-sm text-amber-600 dark:text-amber-400">Training</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-2">
                    <div className="flex w-2 h-2 bg-neutral-600 dark:bg-neutral-400 rounded-full"></div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Not Trained</span>
                </div>
            );
        }
    };
    return (
        <Link href={href} className="flex flex-col justify-between min-h-[125px] w-full p-3 bg-neutral-200 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-800 rounded-md">
            <div className="flex flex-col gap-2">
                <h2 className="text-md font-bold">{title}</h2>
                <p className="text-sm text-neutral-500">{description}</p>
            </div>
            {renderStatus()}
        </Link>
    );
}
