import Logo from "@/components/logo";
import LogoIcon from "@/components/logoIcon";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-screen bg-sidebar">
      <div className="flex w-full flex-col bg-background p-5 md:p-5">
        <Link
          className="flex w-fit items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          href="/"
        >
          <Logo className="h-5" />
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10">
          <div className="flex flex-col gap-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
