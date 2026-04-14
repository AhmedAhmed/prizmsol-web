import Form from "next/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  type = "email",
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  type?: "email" | "otp";
}) {
  return (
    <Form action={action} className="flex flex-col gap-4">
      {type === "email" ? (
        <div className="flex flex-col gap-2">
          <Label
            className="font-normal text-neutral-600 dark:text-neutral-400"
            htmlFor="email"
          >
            Email
          </Label>
          <Input
            autoComplete="email"
            autoFocus
            className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
            defaultValue={defaultEmail}
            id="email"
            name="email"
            placeholder="m@example.com"
            required
            type="email"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label
            className="font-normal text-neutral-600 dark:text-neutral-400"
            htmlFor="otp"
          >
            6-digit code
          </Label>
          <Input
            autoComplete="one-time-code"
            autoFocus
            className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm tracking-widest transition-colors focus:border-foreground/20 focus:bg-muted"
            id="otp"
            inputMode="numeric"
            maxLength={6}
            minLength={6}
            name="otp"
            pattern={"\\d{6}"}
            placeholder="123456"
            required
            type="text"
          />
        </div>
      )}
      {children}
    </Form>
  );
}