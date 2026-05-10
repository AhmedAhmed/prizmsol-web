import AnimatedBadge from "@/components/AnimatedBadge";
import { getCollections, getMessagesCountByUserId } from "@/lib/db/queries";
import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";
import ChatPrompt from "./form";
import Greeting from "@/components/chat/greeting";

type SearchParams = {
    [key: string]: string | string[] | undefined;
}

export default async function NewPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const query = await searchParams;

    const count = await getMessagesCountByUserId();

    const collections = await getCollections();

    const renderError = () => {
        if (query.error == "incomplete") {
            return (
                <div className="self-center px-5 mb-5 w-full max-w-3xl">
                    <div className="flex items-center gap-2 bg-red-100 dark:bg-red-800/20 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative" role="alert">
                        <AlertTriangleIcon size={20} />
                        <strong className="font-bold">Incomplete.</strong>
                        <span className="block sm:inline">Please enter a prompt.</span>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="flex flex-col flex-1 w-full justify-center items-center px-10">
            <div className="flex flex-col gap-10 flex-1 w-full max-w-7xl">
                <div className="flex flex-1 flex-col justify-center w-full">
                    <Link href="/pricing" className="mb-5 flex self-center justify-self-center gap-2">
                        <AnimatedBadge text="Introducing Prizm v1" />
                    </Link>
                    <Greeting />
                    {renderError()}
                    <ChatPrompt collections={collections} count={count} defaultPrompt={query.prompt as string} />
                </div>
                <div className="flex justify-between items-center py-2.5">
                    <div className="flex gap-1 items-center justify-center text-neutral-500">
                        <span className="text-sm">Prizmsol</span>
                        <span className="text-sm">&copy; {new Date().getFullYear()}</span>
                    </div>
                    <ul className="flex gap-5 text-sm">
                        <li className="flex">
                            <Link href="/pricing">
                                Pricing
                            </Link>
                        </li>
                        <li className="flex">
                            <Link href="/legal/terms">
                                Terms
                            </Link>
                        </li>
                        <li className="flex">
                            <Link href="/legal/privacy">
                                Privacy
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
