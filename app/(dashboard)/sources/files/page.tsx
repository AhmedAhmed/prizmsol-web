import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FileSourceForm from "../forms/file-source-form";

export default async function SourcesFilesPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        <FileSourceForm />
    );
}
