import Link from "next/link.js";
import type { ReactNode } from "react";
import { useId } from "react";
import { twJoin, twMerge } from "tailwind-merge";
import pageIndex from "@/build-pages/index.ts";
import { Check } from "@/icons/check.tsx";
import { ChevronDown } from "@/icons/chevron-down.tsx";
import { Close } from "@/icons/close.tsx";

interface DefaultProps {
  className?: string;
  children?: ReactNode;
}

function Button(props: DefaultProps & { colored?: boolean }) {
  return (
    <span
      className={twMerge(
        "flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-base text-black",
        "dark:bg-white/5 dark:text-white",
        "[--border:rgba(0,0,0,0.1)]",
        "[--highlight:rgba(255,255,255,0.2)]",
        "[--shadow:rgba(0,0,0,0.1)]",
        "dark:[--shadow:rgba(0,0,0,0.25)]",
        "dark:[--border:rgba(255,255,255,0.1)]",
        "dark:[--highlight:rgba(255,255,255,0.05)]",
        "[box-shadow:inset_0_0_0_1px_var(--border),inset_0_2px_0_var(--highlight),inset_0_-1px_0_var(--shadow),0_1px_1px_var(--shadow)]",
        "dark:[box-shadow:inset_0_0_0_1px_var(--border),inset_0_-1px_0_1px_var(--shadow),inset_0_1px_0_var(--highlight)]",
        props.colored && [
          "[--border:rgba(0,0,0,0.15)]",
          "[--highlight:rgba(255,255,255,0.25)]",
          "[--shadow:rgba(0,0,0,0.15)]",
          "dark:[--border:rgba(255,255,255,0.25)]",
          "dark:[--highlight:rgba(255,255,255,0.1)]",
          "dark:[--shadow:rgba(0,0,0,0.25)]",
        ],
        props.className,
      )}
    >
      {props.children}
    </span>
  );
}

function Input(props: DefaultProps) {
  return (
    <span
      className={twMerge(
        "flex items-center justify-between gap-2 whitespace-nowrap rounded-lg bg-gray-50 px-4 py-2 text-base text-black",
        "dark:bg-gray-900 dark:text-white",
        "[box-shadow:inset_0_0_0_1px_rgba(0_0_0/0.15),inset_0_2px_5px_0_rgba(0_0_0/0.08)]",
        "dark:[box-shadow:inset_0_0_0_1px_rgba(255_255_255/0.15),inset_0_-1px_0_0_rgba(255_255_255/0.05),inset_0_2px_5px_0_rgba(0_0_0/0.15)]",
        props.className,
      )}
    >
      {props.children}
    </span>
  );
}

function Popup({ layer = 1, ...props }: DefaultProps & { layer?: 1 | 2 | 3 }) {
  return (
    <span
      className={twMerge(
        "relative grid rounded-xl bg-white p-1 text-black dark:bg-gray-750 dark:text-white",
        "[--border-color:rgb(0_0_0/0.1)] dark:[--border-color:rgb(255_255_255/0.12)]",
        "[--shadow-color:rgb(0_0_0/0.25)] dark:[--shadow-color:rgb(0_0_0/0.35)]",
        "[--shadow-border:0_0_0_1px_var(--border-color)]",
        "[box-shadow:var(--shadow-border),var(--shadow-size)_var(--shadow-color)]",
        layer === 1 &&
          "[--shadow-size:0_4px_8px_-4px] dark:[--shadow-size:0_6px_12px_-4px]",
        layer === 2 &&
          "[--shadow-color:rgb(0_0_0/0.2)] [--shadow-size:0_8px_16px_-6px] dark:[--shadow-size:0_12px_24px_-6px]",
        layer === 3 &&
          "[--shadow-color:rgb(0_0_0/0.15)] [--shadow-size:0_16px_32px_-6px] dark:[--shadow-size:0_18px_36px_-8px]",
        props.className,
      )}
    >
      {props.children}
    </span>
  );
}

function MenuItem(props: DefaultProps & { active?: boolean }) {
  return (
    <span
      className={twMerge(
        "flex items-center justify-between gap-4 rounded-lg px-4 py-1.5",
        props.active && "bg-black/[7.5%] dark:bg-white/[7.5%]",
        props.className,
      )}
    >
      {props.children}
    </span>
  );
}

function Highlight(props: DefaultProps) {
  return (
    <span
      className={twMerge(
        "-m-px rounded-sm bg-yellow-300 p-px dark:bg-yellow-900",
        props.className,
      )}
    >
      {props.children}
    </span>
  );
}

function Separator(props: DefaultProps) {
  return (
    <span
      className={twJoin(
        "my-1 h-px w-full bg-black/10 dark:bg-white/10",
        props.className,
      )}
    />
  );
}

function Avatar(props: DefaultProps & { color: "teal" | "pink" | "blue" }) {
  return (
    <span
      className={twMerge(
        "grid size-8 place-items-center rounded-full font-medium",
        props.color === "teal" && "bg-teal-600 text-white dark:bg-teal-700/80",
        props.color === "pink" && "bg-pink-500 text-white dark:bg-pink-700/80",
        props.color === "blue" && "bg-blue-500 text-white dark:bg-blue-700/80",
        props.className,
      )}
    >
      {props.children}
    </span>
  );
}

function LinkBox(
  props: DefaultProps & { href: string; title: string; description: string },
) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  return (
    <Link
      href={props.href}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={twMerge(
        "group relative flex flex-col gap-1 overflow-hidden bg-gray-150 p-8 outline-2 outline-blue-600 focus-visible:outline dark:bg-gray-850",
        props.className,
      )}
    >
      <span
        role="img"
        aria-hidden
        className="absolute inset-0 bottom-6 select-none overflow-hidden"
      >
        <div className="absolute inset-0 flex origin-center scale-[0.8] place-items-start gap-4 transition-[transform] duration-700 sm:group-hover:scale-90">
          {props.children}
        </div>

        <span className="absolute inset-0 block bg-gray-150/10 dark:bg-gray-850/15" />
        <span className="absolute inset-0 block text-gray-150 [background:linear-gradient(-172deg,transparent_calc(100%-7rem),currentColor_calc(100%-4rem))] [box-shadow:inset_0_-1rem_2rem_0.25rem_currentColor,inset_0_0_1rem_1rem_currentColor] dark:text-gray-850" />
      </span>
      <span className="isolate mt-auto">
        <span
          id={titleId}
          className="text-xl font-semibold decoration-1 underline-offset-[0.25em] [text-decoration-skip-ink:none] sm:group-hover:underline"
        >
          {props.title}
        </span>
        <span
          id={descriptionId}
          aria-hidden
          className="line-clamp-1 opacity-80"
        >
          {props.description}
        </span>
      </span>
    </Link>
  );
}

function Dialogs() {
  return (
    <LinkBox
      href="/tags/dialog"
      title="Dialogs"
      description="Command Menu, Nested, Backdrop"
    >
      <span className="relative grid h-full w-full items-start justify-items-center">
        <Popup
          layer={2}
          className="flex w-full origin-bottom scale-95 flex-col p-0 opacity-40 blur-[1px] transition-[transform,filter] duration-700 sm:group-hover:scale-[0.8] sm:group-hover:blur-[4px]"
        >
          <span className="grid grid-cols-[1fr,max-content] items-center gap-4 border-b border-black/10 py-3 pl-5 pr-3 text-black/80 dark:border-white/10 dark:text-white/80">
            <span className="truncate">Search for users</span>
            <span className="rounded-md border border-[inherit] px-2 py-1 text-xs">
              Esc
            </span>
          </span>
          <span className="grid p-1 text-sm">
            <MenuItem>Harry Poe</MenuItem>
            <MenuItem active className="pr-1.5">
              John Doe{" "}
              <span className="rounded border border-black/15 px-2 py-1 text-sm dark:border-white/15">
                Delete
              </span>
            </MenuItem>
            <MenuItem>Jane Doe</MenuItem>
            <MenuItem>Sophie Poe</MenuItem>
            <MenuItem>Tom Doe</MenuItem>
          </span>
        </Popup>
        <Popup
          layer={3}
          className="absolute top-[136px] w-[calc(100%-5rem)] gap-2 p-4 dark:[--border-color:rgb(255_255_255/0.18)]"
        >
          <span className="font-medium">Delete user</span>
          <span className="text-sm">
            Are you sure you want to delete this user?
          </span>
          <span className="mt-2 flex justify-end gap-2 *:text-sm">
            <Button>Cancel</Button>
            <Button
              colored
              className="bg-red-600 text-white dark:bg-red-700/80"
            >
              Delete
            </Button>
          </span>
        </Popup>
      </span>
    </LinkBox>
  );
}

function Dropdowns() {
  return (
    <LinkBox
      href="/tags/dropdowns"
      title="Dropdowns"
      description="Combobox, Menu, Popover, Select"
    >
      <span className="grid gap-2">
        <Button className="mx-1 grid w-[232px] grid-cols-[max-content_1fr_max-content] gap-4 py-3">
          <Avatar color="teal">J</Avatar>
          <span className="grid text-sm">
            <span>John Doe</span>
            <span className="opacity-60">john@email.com</span>
          </span>
          <ChevronDown className="size-5" />
        </Button>
        <Popup>
          <MenuItem className="grid grid-cols-[max-content_1fr_max-content] items-center gap-4 py-3">
            <Avatar color="pink">H</Avatar>
            <span className="grid text-sm">
              <span>Harry Poe</span>
              <span className="opacity-60">harry@email.com</span>
            </span>
          </MenuItem>
          <MenuItem
            active
            className="grid grid-cols-[max-content_1fr_max-content] items-center gap-4 py-3"
          >
            <Avatar color="teal">J</Avatar>
            <span className="grid text-sm">
              <span>John Doe</span>
              <span className="opacity-60">john@email.com</span>
            </span>
            <span className="grid size-5 place-items-center">
              <Check className="size-4" />
            </span>
          </MenuItem>
          <MenuItem className="grid grid-cols-[max-content_1fr_max-content] items-center gap-4 py-3">
            <Avatar color="blue">J</Avatar>
            <span className="grid text-sm">
              <span>Jane Doe</span>
              <span className="opacity-60">jane@email.com</span>
            </span>
          </MenuItem>
        </Popup>
      </span>
      <span className="mt-20 grid justify-items-start gap-2">
        <Button className="ml-1">Actions</Button>
        <Popup className="w-[180px]">
          <MenuItem active>Open</MenuItem>
          <MenuItem>Edit</MenuItem>
          <MenuItem>Share</MenuItem>
          <MenuItem>Delete</MenuItem>
          <Separator />
          <MenuItem>Report</MenuItem>
        </Popup>
      </span>
    </LinkBox>
  );
}

function FormControls() {
  return (
    <LinkBox
      href="/tags/form-controls"
      title="Form controls"
      description="Button, Checkbox, Combobox, Form"
    >
      <span className="my-auto -ml-24 flex min-w-[520px] flex-wrap items-end justify-end gap-4">
        <span className="grid gap-2">
          <span className="ml-4">Account type</span>
          <Button className="pr-3">
            Choose a value <ChevronDown className="size-5" />
          </Button>
        </span>
        <span className="grid gap-2">
          <span className="ml-4">Address</span>
          <Input className="min-w-[200px] pr-2">
            10 Downing St
            <span className="mr-auto h-5 w-px -translate-x-2 bg-current" />
            <span className="grid size-6 place-items-center rounded bg-black/10 dark:bg-white/10">
              <ChevronDown className="size-5" />
            </span>
          </Input>
        </span>
        <Button>Submit</Button>
        <span className="rounded-lg border border-red-300 bg-red-300/40 px-4 py-1.5 text-red-800 dark:border-red-600/30 dark:bg-red-600/15 dark:text-red-50">
          Please fill in this field
        </span>
        <Button>Add new value</Button>
        <Button>
          <Check className="size-5" /> Accept terms and conditions
        </Button>
      </span>
    </LinkBox>
  );
}

function Search() {
  return (
    <LinkBox
      href="/tags/search"
      title="Search"
      description="Combobox, filtering, useTransition"
    >
      <span className="mx-auto grid h-full auto-rows-max items-start gap-2">
        <Input className="mx-1 pr-2">
          mar
          <span className="mr-auto h-5 w-px -translate-x-2 bg-current" />
          <Close className="mx-1 size-4" />
        </Input>
        <Popup className="">
          <span className="relative mb-0.5 flex gap-2 overflow-hidden *:whitespace-nowrap">
            <MenuItem className="bg-gray-150 ring-1 ring-inset ring-black/15 dark:bg-gray-800 dark:ring-white/15">
              All
            </MenuItem>
            <MenuItem>Customers</MenuItem>
            <MenuItem>Invoices</MenuItem>
          </span>
          <span className="grid">
            <span className="px-2 py-2 opacity-60">Customers</span>
            <MenuItem
              active
              className="grid grid-cols-[max-content,1fr] gap-2 px-2"
            >
              <Avatar color="teal" className="size-6 text-sm">
                M
              </Avatar>
              <span>
                <Highlight>Mar</Highlight>
                ianne Jones
              </span>
            </MenuItem>
            <MenuItem className="grid grid-cols-[max-content,1fr] gap-2 px-2">
              <Avatar color="blue" className="size-6 text-sm">
                M
              </Avatar>
              <span>
                <Highlight>Mar</Highlight>
                tin Prince
              </span>
            </MenuItem>
            <MenuItem className="grid grid-cols-[max-content,1fr] gap-2 px-2">
              <Avatar color="pink" className="size-6 text-sm">
                C
              </Avatar>
              <span>
                Carlos <Highlight>Mar</Highlight>x
              </span>
            </MenuItem>
          </span>
          <Separator />
          <span className="grid">
            <span className="px-2 py-2 opacity-60">Invoices</span>
            <MenuItem className="px-2">
              347F32B8-008{" "}
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-sm dark:bg-green-700/30">
                Paid
              </span>
            </MenuItem>
            <MenuItem className="px-2">
              217F22B7-0096{" "}
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-sm dark:bg-green-700/30">
                Paid
              </span>
            </MenuItem>
            <MenuItem className="px-2">
              657F21B2-0026{" "}
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-sm dark:bg-green-700/30">
                Paid
              </span>
            </MenuItem>
          </span>
        </Popup>
      </span>
    </LinkBox>
  );
}

function NextAppRouter() {
  return (
    <LinkBox
      href="/tags/next-js-app-router"
      title="Next.js App Router"
      description="URL state, search params, optimistic updates"
    >
      <span className="h-full w-full">
        <Input className="-ml-44 mt-10 w-max gap-0 rounded-full pr-12 text-black/60 dark:text-white/60">
          https://ariakit.org/?
          <span className="font-medium text-black dark:text-white">lang</span>=
          <span className="-mx-[1px] rounded bg-blue-50/50 px-[2px] font-medium text-blue-700 dark:bg-blue-900/15 dark:font-normal dark:text-blue-300">
            en
          </span>
          &amp;
          <span className="font-medium text-black dark:text-white">status</span>
          =
          <span className="-mx-[1px] rounded bg-blue-50/50 px-[2px] font-medium text-blue-700 dark:bg-blue-900/15 dark:font-normal dark:text-blue-300">
            published
          </span>
          &amp;
          <span className="font-medium text-black dark:text-white">status</span>
          =
          <span className="-mx-[1px] rounded bg-blue-50/50 px-[2px] font-medium text-blue-700 dark:bg-blue-900/15 dark:font-normal dark:text-blue-300">
            archived
          </span>
        </Input>
        <span className="ml-8 mt-8 flex w-max gap-4">
          <span className="grid w-max auto-rows-max justify-start gap-2">
            <Button className="mx-1 w-max pr-3">
              English <ChevronDown className="size-6" />
            </Button>
            <Popup className="w-[180px] *:grid *:grid-cols-[1rem,1fr] *:gap-2 *:px-2">
              <MenuItem active>
                <Check className="size-4" />
                English
              </MenuItem>
              <MenuItem>
                <span />
                French
              </MenuItem>
              <MenuItem>
                <span />
                German
              </MenuItem>
            </Popup>
          </span>
          <span className="mt-8 grid w-max auto-rows-max justify-start gap-2">
            <Button className="mx-1 w-max pr-3">
              2 selected <ChevronDown className="size-6" />
            </Button>
            <Popup className="w-[200px] *:grid *:grid-cols-[1rem,1fr] *:gap-2 *:px-2">
              <MenuItem>
                <span />
                Draft
              </MenuItem>
              <MenuItem active>
                <Check className="size-4" />
                Published
              </MenuItem>
              <MenuItem>
                <Check className="size-4" />
                Archived
              </MenuItem>
            </Popup>
          </span>
        </span>
      </span>
    </LinkBox>
  );
}

const examplesCount = pageIndex.examples!.length;

function More() {
  return (
    <Link
      href="/examples"
      className="group relative flex flex-col items-center justify-center gap-1 overflow-hidden bg-gray-150 p-8 text-xl outline-2 outline-blue-600 focus-visible:outline dark:bg-gray-850"
    >
      <span className="text-5xl">{examplesCount}+</span>{" "}
      <span className="decoration-1 underline-offset-[0.25em] [text-decoration-skip-ink:none] sm:group-hover:underline">
        examples
      </span>
    </Link>
  );
}

export function HomeTagsGrid() {
  return (
    <div className="mx-auto grid max-w-6xl auto-rows-[minmax(380px,1fr)] grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-2 px-3 *:rounded-2xl max-sm:snap-x max-sm:snap-mandatory max-sm:auto-cols-[minmax(320px,1fr)] max-sm:grid-flow-col max-sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] max-sm:overflow-x-auto max-sm:*:snap-center sm:justify-center sm:gap-4">
      <Dialogs />
      <FormControls />
      <Dropdowns />
      <Search />
      <NextAppRouter />
      <More />
    </div>
  );
}
