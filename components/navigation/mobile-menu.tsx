import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <MenuIcon className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col dark:bg-neutral-900 dark:border-neutral-700">
        <div className="flex flex-col flex-1">
          <SheetHeader>
            <SheetTitle>Prizmsol</SheetTitle>
            <SheetDescription>
              We help you build beautiful online experiences.
            </SheetDescription>
          </SheetHeader>
          <ul className="flex flex-col gap-5 my-10">
            <li className="flex gap-5">
              <SheetClose asChild>
                <Link
                  href="/"
                  className="py-2 px-4 w-full hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md"
                >
                  Home
                </Link>
              </SheetClose>
            </li>
            <li className="flex gap-5">
              <SheetClose asChild>
                <Link
                  href="/plans"
                  className="py-2 px-4 w-full hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md"
                >
                  Plan
                </Link>
              </SheetClose>
            </li>
          </ul>
          <SheetFooter>
            <SheetClose asChild>
              <Button asChild>
                <Link href="/login" className="w-full mt-5">
                  Login
                </Link>
              </Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
