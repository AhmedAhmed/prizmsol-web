"use client";
import { usePathname, useRouter } from "next/navigation";

export default function RedirectOnboarding() {
    const router = useRouter();
    const pathname = usePathname();
    if (pathname !== "/onboarding") {
        router.push("/onboarding");
    }
    return null;
}