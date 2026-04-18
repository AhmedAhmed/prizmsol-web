import Logo from "@/components/logo";
import { auth } from "@/lib/auth";
import { getPortfolioByUserId } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingForm from "../onboarding-form";

export default async function Onboarding() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    const user = session?.user;
    const portfolio = await user?.id ? await getPortfolioByUserId(user?.id as string) : null;

    if (portfolio) {
        return redirect("/");
    }

    return (
        <div className="flex flex-col flex-1 items-center justify-center gap-10 p-10">
            <Logo className="h-[20px] absolute top-10 left-10" />
            <div className="flex flex-col gap-2.5 items-center">
                <h1 className="text-4xl font-bold">Welcome to PrizmSol</h1>
                <span className="text-md text-neutral-500">Setup your account and build your professional presence online.</span>
            </div>
            <OnboardingForm portfolio={portfolio} />
        </div>
    );
}
