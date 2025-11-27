import clsx from "clsx";
import type { JSX } from "solid-js";
import { createUniqueId, Show, splitProps } from "solid-js";

export interface DisclosureProps
  extends Omit<JSX.DetailsHtmlAttributes<HTMLDetailsElement>, "content"> {
  /** Custom button element or props to render a `DisclosureButton`. */
  button?: JSX.Element | DisclosureButtonProps;
  /** Custom content element or props to render a `DisclosureContent`. */
  content?: JSX.Element | DisclosureContentProps;
  /**
   * Applies a split layout that visually separates button and content areas.
   */
  split?: boolean;
  /** Custom base class name. */
  baseClassName?: string;
  /** Whether the disclosure is open by default. */
  defaultOpen?: boolean;
}

/**
 * High-level disclosure using native HTML details/summary elements.
 * @example
 * <Disclosure>
 *   <DisclosureButton>Open</DisclosureButton>
 *   <DisclosureContent>Content</DisclosureContent>
 * </Disclosure>
 * @example
 * <Disclosure button="Open">
 *   Content
 * </Disclosure>
 */
export function Disclosure(props: DisclosureProps) {
  const [local, rest] = splitProps(props, [
    "split",
    "baseClassName",
    "button",
    "content",
    "defaultOpen",
    "children",
  ]);

  const hasShorthand = () => local.button != null;

  return (
    <details
      open={local.defaultOpen}
      {...rest}
      class={clsx(
        "group/disclosure open:ak-disclosure_open",
        local.baseClassName || "ak-disclosure",
        local.split && "ak-disclosure-split",
        rest.class,
      )}
    >
      <Show when={hasShorthand()} fallback={local.children}>
        {renderButton(local.button)}
        {renderContent(local.content, local.children)}
      </Show>
    </details>
  );
}

function renderButton(button: DisclosureProps["button"]) {
  if (button == null) return null;
  if (typeof button === "object" && "children" in button) {
    return <DisclosureButton {...(button as DisclosureButtonProps)} />;
  }
  return <DisclosureButton>{button as JSX.Element}</DisclosureButton>;
}

function renderContent(
  content: DisclosureProps["content"],
  children: JSX.Element,
) {
  if (content == null) {
    return <DisclosureContent>{children}</DisclosureContent>;
  }
  if (typeof content === "object" && "children" in content) {
    return <DisclosureContent {...(content as DisclosureContentProps)} />;
  }
  return <DisclosureContent>{content as JSX.Element}</DisclosureContent>;
}

export interface DisclosureGroupProps
  extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Custom base class name. */
  baseClassName?: string;
}

export function DisclosureGroup(props: DisclosureGroupProps) {
  const [local, rest] = splitProps(props, ["baseClassName"]);
  return (
    <div
      {...rest}
      class={clsx(
        local.baseClassName || "ak-disclosure-group",
        "ak-layer-current border-y divide-y divide-(--ak-layer-border)",
        rest.class,
      )}
    />
  );
}

export interface DisclosureButtonProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Optional right-aligned actions rendered inside the button. */
  actions?: JSX.Element;
  /** Secondary text shown below the main label. */
  description?: JSX.Element;
  /** Custom base class name. */
  baseClassName?: string;
  /** Custom icon. */
  icon?: JSX.Element;
  /**
   * Selects chevron/plus icon and placement (start, next, end). Set `false` to
   * hide.
   */
  indicator?:
    | "chevron-down-start"
    | "chevron-down-next"
    | "chevron-down-end"
    | "chevron-right-start"
    | "chevron-right-next"
    | "chevron-right-end"
    | "plus-start"
    | "plus-next"
    | "plus-end"
    | false;
}

export function DisclosureButton(props: DisclosureButtonProps) {
  const [local, rest] = splitProps(props, [
    "actions",
    "description",
    "baseClassName",
    "icon",
    "indicator",
    "children",
  ]);

  const baseId = createUniqueId();
  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  const actionsId = `${baseId}-actions`;

  const indicator = () =>
    local.indicator ??
    (local.icon ? "chevron-down-end" : "chevron-right-start");

  return (
    <>
      <summary
        aria-labelledby={local.description ? labelId : undefined}
        aria-describedby={local.description ? descriptionId : undefined}
        {...rest}
        class={clsx(
          local.baseClassName || "ak-disclosure-button",
          local.description && "ak-command-depth-2",
          indicator() === "chevron-down-start" &&
            "before:ak-disclosure-chevron-down",
          indicator() === "chevron-down-next" &&
            "after:ak-disclosure-chevron-down",
          indicator() === "chevron-down-end" &&
            "after:ak-disclosure-chevron-down after:ms-auto",
          indicator() === "chevron-right-start" &&
            "before:ak-disclosure-chevron-right",
          indicator() === "chevron-right-next" &&
            "after:ak-disclosure-chevron-right",
          indicator() === "chevron-right-end" &&
            "after:ak-disclosure-chevron-right after:ms-auto",
          indicator() === "plus-start" && "before:ak-disclosure-plus",
          indicator() === "plus-next" && "after:ak-disclosure-plus",
          indicator() === "plus-end" &&
            "after:ak-disclosure-plus after:ms-auto",
          rest.class,
        )}
      >
        <Show
          when={local.description}
          fallback={
            <>
              <Show when={local.icon}>
                <span class="ak-disclosure-icon">{local.icon}</span>
              </Show>
              <span class="min-w-0 flex gap-2 items-start">
                <span id={labelId}>{local.children}</span>
                <Show when={local.actions}>
                  <div
                    id={actionsId}
                    onClick={(e) => e.stopPropagation()}
                    class="ak-disclosure-actions"
                  >
                    {local.actions}
                  </div>
                </Show>
              </span>
            </>
          }
        >
          <Show when={local.icon}>
            <span class="ak-disclosure-icon">{local.icon}</span>
          </Show>
          <span class="grid w-full gap-[min(var(--ak-frame-padding)/2,--spacing(2))]">
            <span class="min-w-0 flex gap-2 items-start">
              <span id={labelId}>{local.children}</span>
              <Show when={local.actions}>
                <div
                  id={actionsId}
                  onClick={(e) => e.stopPropagation()}
                  class="ak-disclosure-actions"
                >
                  {local.actions}
                </div>
              </Show>
            </span>
            <span
              id={descriptionId}
              class="ak-text/60 grid gap-[inherit] font-normal text-sm"
            >
              {local.description}
            </span>
          </span>
        </Show>
      </summary>
      <Show when={local.actions}>
        <div aria-owns={actionsId} />
      </Show>
    </>
  );
}

export interface DisclosureContentProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    Pick<DisclosureContentBodyProps, "prose"> {
  /** Custom body element or props to render a `DisclosureContentBody`. */
  body?: JSX.Element | DisclosureContentBodyProps;
  /** Applies a guide to the content. */
  guide?: boolean;
  /** Custom base class name. */
  baseClassName?: string;
}

export function DisclosureContent(props: DisclosureContentProps) {
  const [local, rest] = splitProps(props, [
    "prose",
    "body",
    "guide",
    "baseClassName",
    "children",
  ]);

  return (
    <div
      {...rest}
      class={clsx(
        "group-open/disclosure:ak-disclosure-content_open",
        local.baseClassName || "ak-disclosure-content",
        local.guide && "ak-disclosure-guide",
        rest.class,
      )}
    >
      <Show
        when={
          local.body && typeof local.body === "object" && "prose" in local.body
        }
        fallback={
          <DisclosureContentBody prose={local.prose}>
            {local.children}
          </DisclosureContentBody>
        }
      >
        <DisclosureContentBody {...(local.body as DisclosureContentBodyProps)}>
          {local.children}
        </DisclosureContentBody>
      </Show>
    </div>
  );
}

export interface DisclosureContentBodyProps
  extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Applies prose typography and spacing to the content body. */
  prose?: boolean;
  /** Custom base class name. */
  baseClassName?: string;
}

export function DisclosureContentBody(props: DisclosureContentBodyProps) {
  const [local, rest] = splitProps(props, ["prose", "baseClassName"]);
  return (
    <div
      {...rest}
      class={clsx(
        local.baseClassName || "ak-disclosure-content-body",
        local.prose &&
          "ak-prose ak-prose-gap-[min(var(--ak-frame-padding),--spacing(4))]",
        rest.class,
      )}
    />
  );
}
