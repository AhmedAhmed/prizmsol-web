import GeneralSettingsForm from "./forms/general-settings";
import ImageSelector from "./uploads/image-selector";
import { isEmpty } from "lodash";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    });
    const user = session?.user;
    if (isEmpty(user)) {
        redirect("/");
    }
    return (
        <div className="flex flex-col self-center gap-5 px-5 w-full max-w-4xl py-10">
            <ImageSelector photo={user?.image as string} name={user?.image as string} />
            <GeneralSettingsForm user={user} />
        </div>
    );
}
