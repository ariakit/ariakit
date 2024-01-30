"use client";
import { Button, Dialog } from "@ariakit/react";
import { SignedOut } from "@clerk/clerk-react";
import { AuthEnabled } from "components/auth.jsx";
import { Command } from "components/command.jsx";
import { PlusScreen } from "components/plus-screen.jsx";
import { useRootPathname } from "components/root-pathname.jsx";
import { ArrowLeft } from "icons/arrow-left.jsx";
import Link from "next/link.js";
import { usePathname, useRouter } from "next/navigation.js";

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const rootPathname = useRootPathname();
  return (
    <AuthEnabled>
      <Dialog
        open={pathname === "/plus" && rootPathname !== "/plus"}
        backdrop={false}
        onClose={(event) => {
          event.preventDefault();
          router.back();
        }}
        className="mx-auto mb-20 mt-0 flex flex-col gap-[76px] outline-none ease-in-out animate-in fade-in zoom-in-95 lg:max-w-[952px]"
        render={(props) => (
          <div
            hidden={props.hidden}
            className="fixed inset-0 z-50 overflow-auto bg-gray-50/70 px-3 animate-in fade-in [-webkit-backdrop-filter:blur(16px)] [backdrop-filter:blur(16px)] dark:bg-gray-800/80"
          >
            <div {...props} />
          </div>
        )}
      >
        <header className="flex w-full flex-none items-center justify-between py-2 md:py-4">
          <Button
            className="px-3"
            onClick={router.back}
            render={<Command variant="secondary" flat />}
          >
            <ArrowLeft className="size-4" />
            Back to page
            <div className="-mr-1.5 rounded-md border border-black/10 px-1.5 py-0.5 text-black/80 dark:border-white/10 dark:text-white/80">
              esc
            </div>
          </Button>
          <SignedOut>
            <div className="flex items-center gap-2">
              Already purchased?{" "}
              <Command
                flat
                variant="secondary"
                className="border border-solid border-black/60 px-3 font-medium dark:border-white/60 sm:h-9"
                render={<Link href="/sign-in" />}
              >
                Sign in
              </Command>
            </div>
          </SignedOut>
        </header>
        <PlusScreen />
      </Dialog>
    </AuthEnabled>
  );
}
