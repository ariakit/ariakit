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
import { JavaScript } from "icons/javascript.jsx";
import { TypeScript } from "icons/typescript.jsx";
import { tw } from "utils/tw.js";
import { CopyToClipboard } from "./copy-to-clipboard.jsx";
import { Popup } from "./popup.jsx";
import { TooltipButton } from "./tooltip-button.jsx";

type Language = "ts" | "js";

interface Props {
  language?: Language;
  setLanguage?: (language: Language) => void;
  code?: string | null;
}

const style = {
  toolbarItem: tw`
    flex h-12 w-12 items-center justify-center rounded-md
    focus-visible:ariakit-outline-input sm:rounded-lg sm:h-10 sm:w-10
    text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white
    bg-transparent hover:bg-black/5 dark:hover:bg-white/5
    aria-expanded:!bg-black/10 dark:aria-expanded:!bg-gray-850
  `,
  popupLabel: tw`
    cursor-default
    p-2 text-sm font-medium text-black/60 dark:text-white/50
  `,
  popupItem: tw`
    flex cursor-default scroll-m-2
    items-center gap-2
    rounded p-2 pr-6
    active-item:bg-blue-200/40 active:bg-blue-200/70
    focus-visible:!outline-none dark:active-item:bg-blue-600/25
    dark:active:bg-blue-800/25 [a&]:cursor-pointer
  `,
  separator: tw`
    w-full my-2 h-0
    border-t border-gray-250 dark:border-gray-550
  `,
};

export function PlaygroundToolbar({ language, setLanguage, code }: Props) {
  const toolbar = useToolbarStore();

  const select = useSelectStore({
    value: language,
    setValue: setLanguage,
    placement: "bottom-start",
  });

  const isJS = select.useState((state) => state.value === "js");

  return (
    <Toolbar store={toolbar} className="flex flex-none p-1">
      <ToolbarItem
        className={style.toolbarItem}
        render={(props) => (
          <Select
            store={select}
            aria-label="Select language"
            {...props}
            render={<TooltipButton title="Select language" isLabel />}
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
        <PopoverHeading className={style.popupLabel}>Language</PopoverHeading>
        <SelectItem value="ts" className={style.popupItem}>
          <TypeScript className="h-5 w-5" /> TypeScript
        </SelectItem>
        <SelectItem value="js" className={style.popupItem}>
          <JavaScript className="h-5 w-5" /> JavaScript
        </SelectItem>
      </SelectPopover>
      {code != null && (
        <ToolbarItem
          className={style.toolbarItem}
          render={<CopyToClipboard text={code} />}
        />
      )}
    </Toolbar>
  );
}
