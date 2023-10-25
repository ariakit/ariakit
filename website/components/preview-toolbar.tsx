import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@ariakit/react";
import { track } from "@vercel/analytics/react";
import { Nextjs } from "icons/nextjs.jsx";
import { Vite } from "icons/vite.jsx";
import Link from "next/link.js";
import { twMerge } from "tailwind-merge";
import { openInStackblitz } from "utils/stackblitz.js";
import { useSubscription } from "utils/use-subscription.js";
import { Command } from "./command.jsx";

type Language = "ts" | "js";

export interface PreviewToolbarProps extends ComponentPropsWithoutRef<"div"> {
  exampleId: string;
  files: Record<string, string>;
  javascriptFiles?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  language?: Language;
}

export const PreviewToolbar = forwardRef<HTMLDivElement, PreviewToolbarProps>(
  function PreviewToolbar(
    {
      exampleId,
      files,
      javascriptFiles,
      dependencies,
      devDependencies,
      language,
      ...props
    },
    ref,
  ) {
    const isJS = language === "js";
    const [firstFile] = Object.keys(files);
    const isAppDir =
      !!firstFile && /^(page|layout)\.[mc]?[tj]sx?/.test(firstFile);

    const subscription = useSubscription();
    const hasSubscription = !!subscription.data;

    const onStackblitzClick = (template: "vite" | "next") => {
      if (!hasSubscription) return;
      return () => {
        track("edit-on-stackblitz", { template, exampleId });
        const isDark = document.documentElement.classList.contains("dark");
        openInStackblitz({
          template,
          id: exampleId,
          files: (isJS && javascriptFiles) || files,
          dependencies,
          devDependencies,
          theme: isDark ? "dark" : "light",
        });
      };
    };

    return (
      <div
        ref={ref}
        {...props}
        className={twMerge("flex items-center gap-1.5", props.className)}
      >
        <span className="text-sm font-medium opacity-70">Edit with</span>
        {!isAppDir && (
          <Button
            className="h-8 rounded-md bg-gray-250 pl-2 pr-3 text-sm hover:cursor-pointer hover:bg-gray-300"
            onClick={onStackblitzClick("vite")}
            render={
              <Command
                flat
                render={
                  !hasSubscription ? (
                    <Link href="/plus?feature=edit-examples" scroll={false} />
                  ) : undefined
                }
              />
            }
          >
            <Vite className="h-4 w-4" />
            Vite
          </Button>
        )}
        <Button
          className="h-8 rounded-md bg-gray-250 pl-2 pr-3 text-sm hover:cursor-pointer hover:bg-gray-300"
          onClick={onStackblitzClick("next")}
          render={
            <Command
              flat
              render={
                !hasSubscription ? (
                  <Link href="/plus?feature=edit-examples" scroll={false} />
                ) : undefined
              }
            />
          }
        >
          <Nextjs className="h-4 w-4" />
          Next.js
        </Button>
      </div>
    );
  },
);
