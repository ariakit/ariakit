import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import { createRender } from "../react-utils/create-render.ts";
import type { DisclosureIndicator } from "../react-utils/disclosure-indicator.react.tsx";
import { renderIndicator } from "../react-utils/disclosure-indicator.react.tsx";
import {
  disclosure,
  disclosureActions,
  disclosureButton,
  disclosureContent,
  disclosureContentBody,
  disclosureGroup,
  disclosureIcon,
} from "../styles/disclosure.ts";

export interface DisclosureProps
  extends
    Omit<ak.RoleProps<"div">, "content">,
    Pick<ak.DisclosureProviderProps, "open" | "setOpen" | "defaultOpen">,
    VariantProps<typeof disclosure> {
  /** Custom button element or props to render a `DisclosureButton`. */
  button?: React.ReactNode | DisclosureButtonProps;
  /** Custom content element or props to render a `DisclosureContent`. */
  content?: React.ReactElement | DisclosureContentProps;
  /**
   * Applies a split layout that visually separates button and content areas.
   */
  split?: boolean;
}

/**
 * High-level disclosure that wires button and content through a provider.
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
export function Disclosure({
  open,
  setOpen,
  defaultOpen,
  split,
  button,
  content,
  ...props
}: DisclosureProps) {
  const store = ak.useDisclosureStore({ open, setOpen, defaultOpen });
  const isOpen = ak.useStoreState(store, "open");
  const [variantProps, rest] = splitProps(props, disclosure);
  const buttonEl = createRender(DisclosureButton, button);
  const contentEl = createRender(DisclosureContent, content);
  return (
    <ak.DisclosureProvider store={store}>
      <ak.Role
        data-open={isOpen || undefined}
        {...disclosure.jsx({
          ...variantProps,
          $split: variantProps.$split ?? split,
        })}
        {...rest}
      >
        {button != null ? (
          <>
            <ak.Role render={buttonEl} />
            <ak.Role render={contentEl}>{rest.children}</ak.Role>
          </>
        ) : (
          rest.children
        )}
      </ak.Role>
    </ak.DisclosureProvider>
  );
}

export interface DisclosureGroupProps
  extends ak.RoleProps<"div">, VariantProps<typeof disclosureGroup> {}

export function DisclosureGroup(props: DisclosureGroupProps) {
  const [variantProps, rest] = splitProps(props, disclosureGroup);
  return <ak.Role {...disclosureGroup.jsx(variantProps)} {...rest} />;
}

export interface DisclosureButtonProps
  extends ak.DisclosureProps, VariantProps<typeof disclosureButton> {
  /** Optional right-aligned actions rendered inside the button. */
  actions?: React.ReactNode;
  /** Secondary text shown below the main label. */
  description?: React.ReactNode;
  /** Custom icon. */
  icon?: React.ReactNode;
  /**
   * Selects chevron/plus indicator and placement (start, next, end). Set
   * `false` to hide.
   */
  indicator?: DisclosureIndicator | false;
}

export function DisclosureButton({
  actions,
  description,
  icon,
  indicator = icon ? "chevron-down-end" : "chevron-right-start",
  ...props
}: DisclosureButtonProps) {
  const store = ak.useDisclosureContext();
  const isOpen = ak.useStoreState(store, "open");
  const baseId = React.useId();
  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  const actionsId = `${baseId}-actions`;
  const [variantProps, rest] = splitProps(props, disclosureButton);
  // A nullish check, not truthiness: falsy labels like {0} must still
  // render, since aria-labelledby references the span when a description
  // exists.
  const labelElement =
    rest.children != null ? <span id={labelId}>{rest.children}</span> : null;
  const actionsElement = actions ? (
    <div
      id={actionsId}
      onClick={(event) => event.stopPropagation()}
      {...disclosureActions.jsx({})}
    >
      {actions}
    </div>
  ) : null;
  const labelWrapperElement = (
    <span className="min-w-0 flex gap-2 items-start">
      {labelElement}
      {actionsElement}
    </span>
  );
  const iconElement = icon ? (
    <span {...disclosureIcon.jsx({})}>{icon}</span>
  ) : null;
  const indicatorEl = indicator ? renderIndicator(indicator) : null;
  const atStart = indicator ? indicator.endsWith("-start") : false;
  return (
    <>
      <ak.Disclosure
        render={actionsElement ? <div /> : undefined}
        data-disclosure-button
        aria-labelledby={description ? labelId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        data-open={isOpen || undefined}
        {...disclosureButton.jsx({
          ...variantProps,
          // Taller buttons press deeper, like the legacy ak-command-depth-2.
          $activeDepth:
            variantProps.$activeDepth ?? (description ? 2 : undefined),
          $activeDepthX:
            variantProps.$activeDepthX ?? (description ? 2 : undefined),
        })}
        {...rest}
      >
        {atStart && indicatorEl}
        {iconElement}
        {description ? (
          <span className="grid w-full gap-[min(var(--ak-frame-padding)/2,--spacing(2))]">
            {labelWrapperElement}
            <span
              id={descriptionId}
              className="ak-ink-60 grid gap-[inherit] font-normal text-sm"
            >
              {description}
            </span>
          </span>
        ) : (
          labelWrapperElement
        )}
        {!atStart && indicatorEl}
      </ak.Disclosure>
      {actions && <div aria-owns={actionsId} />}
    </>
  );
}

export interface DisclosureContentProps
  extends ak.DisclosureContentProps, VariantProps<typeof disclosureContent> {
  /** Custom body element or props to render a `DisclosureContentBody`. */
  body?: React.ReactElement | DisclosureContentBodyProps;
  /** Applies a guide to the content. */
  guide?: boolean;
}

export function DisclosureContent({
  body,
  guide,
  ...props
}: DisclosureContentProps) {
  const [variantProps, rest] = splitProps(props, disclosureContent);
  const bodyEl = createRender(DisclosureContentBody, body);
  return (
    <ak.DisclosureContent
      {...disclosureContent.jsx({
        ...variantProps,
        $guide: variantProps.$guide ?? guide,
      })}
      {...rest}
    >
      <ak.Role render={bodyEl}>{rest.children}</ak.Role>
    </ak.DisclosureContent>
  );
}

export interface DisclosureContentBodyProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof disclosureContentBody> {}

export function DisclosureContentBody(props: DisclosureContentBodyProps) {
  const [variantProps, rest] = splitProps(props, disclosureContentBody);
  return <div {...disclosureContentBody.jsx(variantProps)} {...rest} />;
}
