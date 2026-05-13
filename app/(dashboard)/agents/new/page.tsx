import AutogrowTextarea from "@/components/AutogrowTextarea";
import SubmitButton from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth";
import { saveAgent } from "@/lib/db/queries";
import { isEmpty } from "lodash";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CreateAgentPage() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    if (!session?.user?.id) {
        return redirect("/login");
    }

    const submitAction = async (formData: FormData) => {
        "use server";
        const name = formData.get("name") as string;
        const displayName = formData.get("displayName") as string;
        const description = formData.get("description") as string;

        if (!isEmpty(name)) {
            const result = await saveAgent({
                name,
                displayName,
                description,
                userId: session.user.id
            });

            revalidatePath("/", "layout");

            // saved successfully.
            if (result.count > 0) {
                revalidatePath("/agents", "layout");
                return redirect("/agents");
            }
        }
    }

    return (
        <div className="flex flex-col flex-1 justify-center items-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Agent</CardTitle>
                    <CardDescription>
                        Enter the agent details
                    </CardDescription>
                </CardHeader>
                <form action={submitAction}>
                    <CardContent>
                        <div className="flex flex-col gap-6 mb-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Name your agent"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="displayName">Display Name</Label>
                                </div>
                                <Input
                                    id="displayName"
                                    type="text"
                                    name="displayName"
                                    placeholder="Display name for your agent"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="description">Description</Label>
                                </div>
                                <AutogrowTextarea id="description" name="description" placeholder="Add a description for your agent" required />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <SubmitButton className="w-full" text="Create" pendingText="Creating" />
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
