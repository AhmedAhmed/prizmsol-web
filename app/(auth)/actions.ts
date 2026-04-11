"use server";

import { z } from "zod";
import { createUser, getUser, updateUserStripeCustomerId } from "@/lib/db/queries";
import { getStripe } from "@/lib/stripe/server";

const authFormSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});
const registerFormSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
});

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
  email?: string;
  password?: string;
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const [user] = await getUser(validatedData.email);
    if (!user) return { status: "failed" };

    // Return credentials so the client can call signIn()
    return {
      status: "success",
      email: validatedData.email,
      password: validatedData.password,
    };
  } catch (error) {
    if (error instanceof z.ZodError) return { status: "invalid_data" };
    return { status: "failed" };
  }
};

export type RegisterActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
  email?: string;
  password?: string;
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = registerFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const [user] = await getUser(validatedData.email);
    if (user) return { status: "user_exists" };

    const [createdUser] = await createUser(
      validatedData.name,
      validatedData.email,
      validatedData.password
    );

    if (createdUser?.id) {
      const stripe = getStripe();
      const customer = await stripe.customers.create({
        email: validatedData.email,
        name: validatedData.name,
        metadata: { userId: createdUser.id },
      });

      await updateUserStripeCustomerId({
        userId: createdUser.id,
        stripeCustomerId: customer.id,
      });
    }

    // Return credentials so the client can call signIn()
    return {
      status: "success",
      email: validatedData.email,
      password: validatedData.password,
    };
  } catch (error) {
    if (error instanceof z.ZodError) return { status: "invalid_data" };
    return { status: "failed" };
  }
};