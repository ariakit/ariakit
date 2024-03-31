import {
  PopoverHeading,
  Select,
  SelectItem,
  SelectPopover,
  Toolbar,
  ToolbarItem,
  useSelectStore,
  useToolbarStore,
} from "@ariakit/react";
import { JavaScript } from "icons/javascript.tsx";
import { TypeScript } from "icons/typescript.tsx";
import { twJoin } from "tailwind-merge";
import { CopyToClipboard } from "./copy-to-clipboard.tsx";
import { Popup } from "./popup.tsx";
import { TooltipButton } from "./tooltip-button.tsx";

type Language = "ts" | "js";

interface Props {
  language?: Language;
  setLanguage?: (language: Language) => void;
  code?: string | null;
}

const toolbarItemClassName = twJoin(
  "flex size-12 items-center justify-center rounded-md",
  "focus-visible:ariakit-outline-input sm:rounded-lg sm:size-10",
  "text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white",
  "bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
  "aria-expanded:!bg-black/10 dark:aria-expanded:!bg-gray-850",
);

const popupItemClassName = twJoin(
  "flex cursor-default scroll-m-2",
  "items-center gap-2",
  "rounded p-2 pr-6",
  "active-item:bg-blue-200/40 active:bg-blue-200/70",
  "focus-visible:!outline-none dark:active-item:bg-blue-600/25",
  "dark:active:bg-blue-800/25 [a&]:cursor-pointer",
);

export function PlaygroundToolbar({ language, setLanguage, code }: Props) {
  const toolbar = useToolbarStore();

  const select = useSelectStore({
    value: language,
    setValue: setLanguage,
    placement: "bottom-start",
  });

  const isJS = select.useState((state) => state.value === "js");

  return (
    <Toolbar store={toolbar} className="flex flex-none px-1">
      <ToolbarItem
        className={toolbarItemClassName}
        render={(props) => (
          <Select
            store={select}
            aria-label="Select language"
            {...props}
            render={<TooltipButton title="Select language" />}
          />
        )}
      >
        <span className="sr-only">{isJS ? "JavaScript" : "TypeScript"}</span>
        {isJS ? (
          <JavaScript className="h-5 w-5" />
        ) : (
          <TypeScript className="h-5 w-5" />
        )}
      </ToolbarItem>

      <SelectPopover
        store={select}
        portal
        shift={-6}
        render={<Popup size="responsive" />}
      >
        <PopoverHeading className="cursor-default p-2 text-sm font-medium text-black/60 dark:text-white/50">
          Language
        </PopoverHeading>
        <SelectItem value="ts" className={popupItemClassName}>
          <TypeScript className="h-5 w-5" /> TypeScript
        </SelectItem>
        <SelectItem value="js" className={popupItemClassName}>
          <JavaScript className="h-5 w-5" /> JavaScript
        </SelectItem>
      </SelectPopover>
      {code != null && (
        <ToolbarItem
          className={toolbarItemClassName}
          render={<CopyToClipboard text={code} />}
        />
      )}
    </Toolbar>
  );
}
