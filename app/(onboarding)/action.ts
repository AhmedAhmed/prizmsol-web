"use server";
import { auth } from "@/lib/auth";
import { updatePortfolio } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { OnboardingFormSchema, OnboardingFormState } from "./definitions";

export async function updatePortfolioAction(
  _state: OnboardingFormState,
  formData: FormData,
) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  const user = session?.user;

  const title = formData.get("title") as string;
  const vanity = formData.get("vanity") as string;
  const description = formData.get("description") as string;

  console.log("Title", title, "Vanity", vanity, "Description", description);

  // Validate form fields
  const validatedFields = OnboardingFormSchema.safeParse({
    title: title,
    vanity: vanity,
    description: description,
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const response = await updatePortfolio({
    userId: user?.id as string,
    vanity: validatedFields.data.vanity,
    photo: user?.image as string,
    title: validatedFields.data.title,
    description: validatedFields.data.description,
    theme: "prizm",
    config: {},
  });

  if (response) {
    revalidatePath("/", "layout");
    return {
      errors: {
        title: [],
        vanity: [],
        description: [],
      },
      status: 200,
    };
  } else {
    return {
      errors: {
        title: [],
        vanity: [],
        description: [],
        global: ["Something went wrong. Please try again."],
      },
      status: 400,
    };
  }
}

export async function onboardingAction(
  _state: OnboardingFormState,
  formData: FormData,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  if (!user) {
    return { status: 401, errors: { global: ["Unauthorized"] } };
  }

  const validatedFields = OnboardingFormSchema.safeParse({
    title: formData.get("title"),
    vanity: formData.get("vanity"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await updatePortfolio({
      userId: user.id,
      vanity: validatedFields.data.vanity,
      photo: user.image as string,
      title: validatedFields.data.title,
      description: validatedFields.data.description,
      theme: "prizm",
      config: {},
    });

    revalidatePath("/", "layout");
    return {
      status: 200,
      errors: {},
    };
  } catch (error: any) {
    // Catch the specific error thrown by updatePortfolio
    if (error.message === 'Portfolio vanity already created') {
      return {
        status: 400,
        errors: {
          vanity: ["This vanity URL is already taken."],
        },
      };
    }

    // Fallback for database or connection errors
    return {
      status: 500,
      errors: {
        global: ["Failed to save portfolio. Please try again later."],
      },
    };
  }
}