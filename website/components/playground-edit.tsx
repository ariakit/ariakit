import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuProvider,
  PopoverHeading,
  Select,
  SelectItem,
  SelectItemCheck,
  SelectPopover,
  SelectProvider,
} from "@ariakit/react";
import { track } from "@vercel/analytics/react";
import Link from "next/link.js";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { twJoin, twMerge } from "tailwind-merge";
import useLocalStorageState from "use-local-storage-state";
import { Edit } from "@/icons/edit.tsx";
import { NewWindow } from "@/icons/new-window.tsx";
import { Nextjs } from "@/icons/nextjs.tsx";
import { Vite } from "@/icons/vite.tsx";
import { openInStackblitz } from "@/lib/stackblitz.ts";
import { useSubscription } from "@/lib/use-subscription.ts";
import { Command } from "./command.tsx";
import { Popup, PopupItem, PopupLabel } from "./popup2.tsx";
import { TooltipButton } from "./tooltip-button.tsx";

type Language = "ts" | "js";

const buildTools: Record<string, { label: string; Icon: typeof Vite }> = {
  vite: { label: "Vite", Icon: Vite },
  next: { label: "Next.js", Icon: Nextjs },
};

export interface PlaygroundEditProps {
  exampleId: string;
  files: Record<string, string>;
  javascriptFiles?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  language?: Language;
}

function useStackblitz({
  exampleId,
  language,
  files,
  javascriptFiles,
  dependencies,
  devDependencies,
}: PlaygroundEditProps) {
  const subscription = useSubscription();
  const hasSubscription = !!subscription.data;

  const isJS = language === "js";
  const [firstFile] = Object.keys(files);
  const isAppDir =
    !!firstFile && /^(page|layout)\.[mc]?[tj]sx?/.test(firstFile);

  const [_buildTool, setBuildTool] = useLocalStorageState("build-tool", {
    defaultValue: "vite",
  });

  const buildTool = isAppDir ? "next" : _buildTool;

  const createOpenInStackblitz = (template = buildTool) => {
    if (!hasSubscription) return;
    if (template !== "next" && template !== "vite") return;
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

  const maybeRenderPlusLink = () => {
    if (hasSubscription) return;
    return <Link href="/plus?feature=edit-examples" scroll={false} />;
  };

  return {
    hasSubscription,
    isAppDir,
    buildTool,
    setBuildTool,
    createOpenInStackblitz,
    maybeRenderPlusLink,
  };
}

export interface PlaygroundEditToolbarButtonProps
  extends ComponentPropsWithoutRef<"button">,
    PlaygroundEditProps {}

export const PlaygroundEditToolbarButton = forwardRef<
  HTMLButtonElement,
  PlaygroundEditToolbarButtonProps
>(function PlaygroundEditToolbarButton(
  {
    exampleId,
    files,
    javascriptFiles,
    dependencies,
    devDependencies,
    ...props
  },
  ref,
) {
  const {
    hasSubscription,
    isAppDir,
    createOpenInStackblitz,
    maybeRenderPlusLink,
  } = useStackblitz({
    exampleId,
    files,
    javascriptFiles,
    dependencies,
    devDependencies,
  });

  const renderMenuItem = (value: string) => {
    const buildToolObject = buildTools[value];
    if (!buildToolObject) return null;
    const { label, Icon } = buildToolObject;
    return (
      <MenuItem
        key={value}
        hideOnClick={hasSubscription}
        onClick={createOpenInStackblitz(value)}
        className="group grid cursor-pointer grid-cols-[1rem_1fr_1rem] items-center gap-2"
        render={<PopupItem render={maybeRenderPlusLink()} />}
      >
        <Icon className="size-full" />
        <span className="pr-6">{label}</span>
        <NewWindow className="size-full opacity-80" />
      </MenuItem>
    );
  };

  return (
    <MenuProvider placement="bottom-start">
      <MenuButton
        ref={ref}
        {...props}
        className={twMerge("", props.className)}
        render={<TooltipButton title="Edit example" />}
      >
        <span className="sr-only">Edit example</span>
        <Edit className="size-5" />
      </MenuButton>
      <Menu
        gutter={9}
        shift={-2}
        unmountOnHide
        portal
        render={
          <Popup animated size="responsive" className="origin-top-left" />
        }
      >
        <PopoverHeading render={<PopupLabel />}>Edit with</PopoverHeading>
        {!isAppDir && renderMenuItem("vite")}
        {renderMenuItem("next")}
      </Menu>
    </MenuProvider>
  );
});

export interface PlaygroundEditButtonProps
  extends ComponentPropsWithoutRef<"div">,
    PlaygroundEditProps {
  type?: "call-to-action" | "header";
}

export const PlaygroundEditButton = forwardRef<
  HTMLDivElement,
  PlaygroundEditButtonProps
>(function PlaygroundEditButton(
  {
    exampleId,
    files,
    javascriptFiles,
    dependencies,
    devDependencies,
    language,
    type = "header",
    ...props
  },
  ref,
) {
  const {
    hasSubscription,
    isAppDir,
    buildTool,
    setBuildTool,
    createOpenInStackblitz,
    maybeRenderPlusLink,
  } = useStackblitz({
    exampleId,
    files,
    javascriptFiles,
    dependencies,
    devDependencies,
    language,
  });

  const buildToolObject = buildTools[buildTool];
  if (!buildToolObject) {
    throw new Error(`Invalid build tool: ${buildTool}`);
  }

  const { label: buildToolLabel, Icon: BuiltToolIcon } = buildToolObject;

  const renderSelectItem = (value: string) => {
    const buildToolObject = buildTools[value];
    if (!buildToolObject) return null;
    const { label, Icon } = buildToolObject;
    return (
      <SelectItem
        key={value}
        value={value}
        hideOnClick={hasSubscription}
        setValueOnClick={hasSubscription}
        onClick={createOpenInStackblitz(value)}
        className="group grid cursor-pointer grid-cols-[1rem_1fr_1rem] items-center gap-2"
        render={<PopupItem render={maybeRenderPlusLink()} />}
      >
        <Icon className="size-full" />
        <span className="pr-6">{label}</span>
        <SelectItemCheck className="group-data-[active-item]:hidden" />
        <NewWindow className="hidden size-full opacity-80 group-data-[active-item]:block" />
      </SelectItem>
    );
  };

  const tooltip = (
    <div className="!z-auto max-w-[calc(var(--popover-anchor-width)+48px+6px)] !border-none !bg-transparent !px-0 !py-3 transition-[opacity,transform] ![box-shadow:none] [&:not([data-enter])]:-translate-y-1 [&:not([data-enter])]:opacity-0" />
  );

  const tooltipTitle = (
    <div>
      Open VSCode in the browser{" "}
      <span className="whitespace-nowrap">
        &#x2060;
        <NewWindow className="mb-0.5 inline size-[1em] stroke-black/60 dark:stroke-white/60" />
      </span>
    </div>
  );

  return (
    <div
      ref={ref}
      {...props}
      className={twMerge(
        type === "call-to-action"
          ? "[--block-size:48px]"
          : "[--block-size:40px]",
        "grid grid-cols-[auto_var(--block-size)] grid-rows-[var(--block-size)] gap-1.5",
        props.className,
      )}
    >
      <Command
        flat
        variant="primary"
        onClick={createOpenInStackblitz()}
        className={twJoin(
          "h-auto !cursor-pointer pl-4 pr-5",
          type === "call-to-action" && "text-lg shadow-xl",
        )}
        render={
          type === "call-to-action" ? (
            <TooltipButton
              title={tooltipTitle}
              placement="bottom-start"
              showTimeout={100}
              hideTimeout={250}
              gutter={0}
              popup={tooltip}
              render={maybeRenderPlusLink()}
            />
          ) : (
            <Button render={maybeRenderPlusLink()} />
          )
        }
      >
        <Edit />
        Edit example
      </Command>
      <SelectProvider
        placement="bottom-end"
        value={buildTool}
        setValue={(value: typeof buildTool) => {
          if (isAppDir) return;
          setBuildTool(value);
        }}
      >
        <TooltipButton
          title={`Using ${buildToolLabel}`}
          aria-label="Build tool"
          className="size-auto bg-black/[7%] p-0 hover:bg-black/[12%] dark:bg-white/5 dark:hover:bg-white/10"
          render={<Select render={<Command flat variant="secondary" />} />}
        >
          <BuiltToolIcon className="size-5" />
          <span className="sr-only">{buildToolLabel}</span>
        </TooltipButton>
        <SelectPopover
          gutter={7}
          unmountOnHide
          portal
          shift={-4}
          render={<Popup animated className="origin-top-right" />}
        >
          <PopoverHeading render={<PopupLabel />}>Edit with</PopoverHeading>
          {!isAppDir && renderSelectItem("vite")}
          {renderSelectItem("next")}
        </SelectPopover>
      </SelectProvider>
    </div>
  );
});
