"use client";
import { Dialog } from "@ariakit/react";
import { AuthEnabled } from "components/auth.jsx";
import { PlusScreen } from "components/plus-screen.jsx";
import { useRootPathname } from "components/root-pathname.jsx";
import { usePathname, useRouter } from "next/navigation.js";

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const rootPathname = useRootPathname();
  return (
    <AuthEnabled>
      <Dialog
        open={pathname.includes("/plus") && !rootPathname.includes("/plus")}
        onClose={router.back}
        className="fixed inset-3 z-50 mx-auto mb-8 mt-16 h-min max-h-[calc(100vh-2*theme(spacing.16))] overflow-auto rounded-xl border border-gray-250 bg-white text-black outline-none ease-in-out animate-in fade-in zoom-in-95 shadow-xl dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:shadow-xl-dark sm:rounded-2xl md:rounded-3xl lg:max-w-[952px]"
        backdrop={
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm animate-in fade-in dark:bg-black/50" />
        }
      >
        <PlusScreen />
      </Dialog>
    </AuthEnabled>
  );
}
