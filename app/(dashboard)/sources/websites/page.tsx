import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import WebsiteSourceForm from "../forms/website-source-form";

export default async function SourcesWebsitesPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        <WebsiteSourceForm />
    );
}
