import {
  PopoverHeading,
  Select,
  SelectItem,
  SelectItemCheck,
  SelectPopover,
  SelectProvider,
  SelectValue,
  Toolbar,
  ToolbarItem,
} from "@ariakit/react";
import { twJoin } from "tailwind-merge";
import { Edit } from "@/icons/edit.tsx";
import { JavaScript } from "@/icons/javascript.tsx";
import { TypeScript } from "@/icons/typescript.tsx";
import { AuthEnabled } from "./auth.tsx";
import { CopyToClipboard } from "./copy-to-clipboard.tsx";
import type { PlaygroundEditProps } from "./playground-edit.tsx";
import { PlaygroundEditToolbarButton } from "./playground-edit.tsx";
import { Popup, PopupItem, PopupLabel } from "./popup2.tsx";
import { TooltipButton } from "./tooltip-button.tsx";

type Language = "ts" | "js";

export interface PlaygroundToolbarProps extends PlaygroundEditProps {
  language?: Language;
  setLanguage?: (language: Language) => void;
  code?: string | null;
}

const toolbarItemClassName = twJoin(
  "flex size-12 items-center justify-center rounded-md",
  "active:pt-px",
  "focus-visible:ariakit-outline-input sm:rounded-lg sm:size-10",
  "text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white",
  "bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
  "aria-expanded:!bg-black/10 dark:aria-expanded:!bg-gray-850",
);

export function PlaygroundToolbar({
  language,
  setLanguage,
  code,
  ...props
}: PlaygroundToolbarProps) {
  const languages = {
    ts: { label: "TypeScript", Icon: TypeScript },
    js: { label: "JavaScript", Icon: JavaScript },
  };

  const renderSelectItem = (value: keyof typeof languages) => {
    const { label, Icon } = languages[value];
    return (
      <SelectItem
        key={value}
        value={value}
        blurOnHoverEnd={false}
        className="group grid grid-cols-[20px_1fr_1rem] items-center gap-2 sm:[--block-padding:8px]"
        render={<PopupItem />}
      >
        <Icon className="size-full" />
        <span>{label}</span>
        <SelectItemCheck />
      </SelectItem>
    );
  };

  return (
    <Toolbar className="flex flex-none px-1">
      <SelectProvider
        value={language}
        setValue={setLanguage}
        placement="bottom-start"
      >
        <ToolbarItem
          className={toolbarItemClassName}
          render={
            <Select
              aria-label="Select language"
              render={<TooltipButton title="Select language" />}
            />
          }
        >
          <SelectValue>
            {(value) => {
              if (Array.isArray(value)) return;
              const language = languages[value as keyof typeof languages];
              if (!language) return;
              const { label, Icon } = language;
              return (
                <>
                  <span className="sr-only">{label}</span>
                  <Icon className="size-5" />
                </>
              );
            }}
          </SelectValue>
        </ToolbarItem>

        <SelectPopover
          portal
          gutter={9}
          shift={-2}
          render={
            <Popup size="responsive" animated className="origin-top-left" />
          }
        >
          <PopoverHeading render={<PopupLabel />}>Language</PopoverHeading>
          {renderSelectItem("ts")}
          {renderSelectItem("js")}
        </SelectPopover>
      </SelectProvider>

      <AuthEnabled>
        <ToolbarItem
          className={toolbarItemClassName}
          render={
            <PlaygroundEditToolbarButton language={language} {...props} />
          }
        >
          <span className="sr-only">Edit example</span>
          <Edit className="size-5" />
        </ToolbarItem>
      </AuthEnabled>

      {code != null && (
        <ToolbarItem
          className={toolbarItemClassName}
          render={<CopyToClipboard text={code} />}
        />
      )}
    </Toolbar>
  );
}
