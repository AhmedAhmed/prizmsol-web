import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getPortfolioVanity, getUserById } from "@/lib/db/queries";
import { MessageCircleIcon } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function SitePage({
    params
}: {
    params: Promise<{ id: string; }>
}) {
    let loggedInUser = null;
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    });

    if (session) {
        loggedInUser = session.user;
    }

    const p = await params;
    const portfolio = await getPortfolioVanity(p?.id as string);
    if (!portfolio) {
        return notFound();
    }
    const user = await getUserById(portfolio?.userId as string);
    return (
        <div className="flex flex-1">
            <div className="flex flex-col w-full max-w-2/5 bg-neutral-100 dark:bg-neutral-950">
                <div className="flex flex-col gap-5 justify-center flex-1 pt-10 px-10">
                    {<div className="flex w-[150px] h-[150px] bg-red-500 rounded-full">
                        <Image
                            src={user?.image as string}
                            alt={user?.name as string}
                            width={150}
                            height={150}
                            className="rounded-full"
                        />
                    </div>}
                    <h1 className="capitalize font-bold text-3xl">{portfolio?.title}</h1>
                    <h3 className="text-md">
                        {portfolio?.description}
                    </h3>
                    <div className="flex gap-2 mt-5">
                        <Button className="h-8 capitalize">
                            <MessageCircleIcon className="h-4 w-4" />
                            <span>Message {user?.name}</span>
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-full max-w-3/5 bg-white dark:bg-black">

            </div>
        </div>
    );
}

