"use server";

import { auth } from "@/lib/auth";
import { updateUserInformation } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const handleImageUpdate = async (formData: FormData) => {
  "use server";
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })
  const user = session?.user;
  const photo = formData.get("fileUrl") as string;
  const isUpdated = await updateUserInformation(user?.id as string, {
      image: photo,
  });
  console.log("isUpdated: ", isUpdated, photo);
  if (isUpdated) {
    revalidatePath("/", "layout");
  }
};

