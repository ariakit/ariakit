"use client";
import { Button, Dialog } from "@ariakit/react";
import { SignedOut } from "@clerk/clerk-react";
import Link from "next/link.js";
import { usePathname, useRouter, useSearchParams } from "next/navigation.js";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef, Suspense } from "react";
import { AuthEnabled } from "@/components/auth.tsx";
import { Command } from "@/components/command.tsx";
import { PlusScreen } from "@/components/plus-screen.tsx";
import { useRootPathname } from "@/components/root-pathname.tsx";
import { ArrowLeft } from "@/icons/arrow-left.tsx";

const SignInLink = forwardRef<
  ElementRef<typeof Link>,
  Omit<ComponentPropsWithoutRef<typeof Link>, "href">
>(function SignInLink(props, ref) {
  const rootPathname = useRootPathname();
  const searchParams = useSearchParams();
  const search = searchParams.size ? `?${searchParams}` : "";
  return (
    <Link
      ref={ref}
      href={`/sign-in?redirect_url=${encodeURIComponent(
        `${rootPathname}${search}`,
      )}`}
      {...props}
    />
  );
});

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
            <div className="-mr-1.5 hidden rounded-md border border-black/10 px-1.5 py-0.5 text-black/80 sm:block dark:border-white/10 dark:text-white/80">
              esc
            </div>
          </Button>
          <SignedOut>
            <Suspense>
              <div className="flex items-center gap-2">
                <span className="hidden sm:block">Already purchased? </span>
                <Command
                  flat
                  variant="secondary"
                  className="border border-solid border-black/60 px-3 font-medium focus-visible:!ariakit-outline sm:h-9 dark:border-white/60"
                  render={<SignInLink />}
                >
                  Sign in
                </Command>
              </div>
            </Suspense>
          </SignedOut>
        </header>
        <Suspense>
          <PlusScreen />
        </Suspense>
      </Dialog>
    </AuthEnabled>
  );
}
