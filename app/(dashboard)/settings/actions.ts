"use server";
import { revalidatePath } from "next/cache";
import { SettingsFormSchema, SettingsFormState } from "./definitions";
import { updateUserInformation } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function settingsAction(_state: SettingsFormState, formData: FormData) {

    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    const user = session?.user;

    // Validate form fields
    const validatedFields = SettingsFormSchema.safeParse({
        name: formData.get('name'),
    })

    console.log("validatedFields: ", validatedFields);

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

   const isUpdated = await updateUserInformation(user?.id as string, {
        name: validatedFields.data.name,
    });

    if (isUpdated) {
        revalidatePath("/", "layout");
        return {
            errors: {
                name: [],
            },
            status: 200,
        };
    } else {
        return {
            errors: {
                name: [],
                global: ["Something went wrong. Please try again."],
            },
            status: 400,
        };
    }
}
