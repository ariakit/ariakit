import { cx } from "@ariakit/core/utils/misc";
import {
  Menu,
  MenuButton,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuProvider,
  MenuSeparator,
  PopoverHeading,
  Select,
  SelectItem,
  SelectPopover,
  Toolbar,
  ToolbarItem,
  useSelectStore,
  useToolbarStore,
} from "@ariakit/react";
import { track } from "@vercel/analytics";
import { Github } from "icons/github.jsx";
import { JavaScript } from "icons/javascript.jsx";
import { NewWindow } from "icons/new-window.jsx";
import { Nextjs } from "icons/nextjs.jsx";
import { TypeScript } from "icons/typescript.jsx";
import { Vite } from "icons/vite.jsx";
import Link from "next/link.js";
import { openInStackblitz } from "utils/stackblitz.js";
import { tw } from "utils/tw.js";
import { CopyToClipboard } from "./copy-to-clipboard.jsx";
import { Popup } from "./popup.jsx";
import { TooltipButton } from "./tooltip-button.jsx";

type Language = "ts" | "js";

interface Props {
  exampleId: string;
  files: Record<string, string>;
  javascriptFiles?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  previewLink?: string;
  githubLink?: string;
  language?: Language;
  setLanguage?: (language: Language) => void;
  code?: string | null;
}

const style = {
  toolbar: tw`
    flex flex-none p-1
  `,
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

export function PlaygroundToolbar({
  exampleId,
  previewLink,
  githubLink,
  files,
  javascriptFiles,
  dependencies,
  devDependencies,
  language,
  setLanguage,
  code,
}: Props) {
  const toolbar = useToolbarStore();

  const select = useSelectStore({
    value: language,
    setValue: setLanguage,
    placement: "bottom-start",
  });

  const isJS = select.useState((state) => state.value === "js");

  const [firstFile] = Object.keys(files);
  const isAppDir =
    !!firstFile && /^(page|layout)\.[mc]?[tj]sx?/.test(firstFile);

  const onStackblitzClick = (template: "vite" | "next") => {
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
    <Toolbar store={toolbar} className={style.toolbar}>
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

      <MenuProvider>
        <ToolbarItem
          className={style.toolbarItem}
          render={
            <MenuButton
              render={<TooltipButton title="Open example in a new tab" />}
            />
          }
        >
          <span className="sr-only">Open example in a new tab</span>
          <NewWindow strokeWidth={1.5} className="h-5 w-5" />
        </ToolbarItem>
        <Menu portal shift={-6} render={<Popup size="responsive" />}>
          {previewLink && (
            <MenuItem
              className={style.popupItem}
              render={<Link target="__blank" href={previewLink} />}
            >
              <NewWindow strokeWidth={1.5} className="h-5 w-5 opacity-70" />{" "}
              Open preview
            </MenuItem>
          )}
          {githubLink && (
            <MenuItem
              className={style.popupItem}
              render={<Link target="__blank" href={githubLink} />}
            >
              <Github className="h-5 w-5 p-0.5" /> View on GitHub
            </MenuItem>
          )}
          {(previewLink || githubLink) && (
            <MenuSeparator className={style.separator} />
          )}
          <MenuGroup>
            <MenuGroupLabel className={style.popupLabel}>
              Edit on StackBlitz
            </MenuGroupLabel>
            {!isAppDir && (
              <MenuItem
                className={cx(style.popupItem, "!cursor-pointer")}
                onClick={onStackblitzClick("vite")}
              >
                <Vite className="h-5 w-5" /> Vite
              </MenuItem>
            )}
            <MenuItem
              className={cx(style.popupItem, "!cursor-pointer")}
              onClick={onStackblitzClick("next")}
            >
              <Nextjs className="h-5 w-5" /> Next.js
            </MenuItem>
          </MenuGroup>
        </Menu>
      </MenuProvider>

      {code != null && (
        <ToolbarItem
          className={style.toolbarItem}
          render={<CopyToClipboard text={code} />}
        />
      )}
    </Toolbar>
  );
}
