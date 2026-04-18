import BackButton from "@/components/ui/back-button";
import { auth } from "@/lib/auth";
import { getPortfolioByUserId } from "@/lib/db/queries";
import { headers } from "next/headers";
import OnboardingForm from "../onboarding-form";

export default async function Portfolio() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    const user = session?.user;
    const portfolio = await user?.id ? await getPortfolioByUserId(user?.id as string) : null;
    return (
        <div className="flex flex-col flex-1 items-center justify-center gap-10 p-10">
            <BackButton className="absolute top-5 left-5" />
            <div className="flex flex-col gap-2.5 items-center w-full">
                <h1 className="text-4xl font-bold">Portfolio Details</h1>
                <OnboardingForm portfolio={portfolio} edit />
            </div>
        </div>
    );
}