import type {
  ShortcutGlyphs,
  ShortcutKeyNames,
  ShortcutPlatform,
} from "@ariakit/components/shortcut/shortcut-store";
import {
  createElement,
  createHook,
  forwardRef,
  useMergeRefs,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import { isElement } from "@ariakit/utils";
import type { ElementType, ReactNode } from "react";
import { Fragment, useContext, useState } from "react";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";
import {
  useShortcutPlatform,
  useShortcutRegistryVersion,
} from "./__shortcut-store.ts";
import {
  UnstableShortcutCommandContext,
  UnstableShortcutScopeContext,
  useShortcutContext,
} from "./shortcut-context.tsx";
import type { ShortcutStore } from "./shortcut-store.ts";

const TagName = "kbd" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getDocumentOrigin(element: Element | null) {
  if (!element) return;
  let origin = element.ownerDocument.activeElement;
  while (origin?.shadowRoot) {
    const activeElement = origin.shadowRoot.activeElement;
    if (!isElement(activeElement)) break;
    origin = activeElement;
  }
  if (!isElement(origin)) return null;
  const activeDescendant = origin.getAttribute("aria-activedescendant");
  if (!activeDescendant) return origin;
  const root = origin.getRootNode();
  if (!("getElementById" in root)) return origin;
  if (typeof root.getElementById !== "function") return origin;
  return root.getElementById(activeDescendant) ?? origin;
}

function renderKeyToken(
  token: { value: string; text: string; name?: string },
  index: number,
) {
  let children: ReactNode = token.text;
  if (token.name) {
    children = (
      <>
        <span aria-hidden="true">{token.text}</span>
        <VisuallyHidden>{token.name}</VisuallyHidden>
      </>
    );
  }
  return (
    // A chord can repeat a key, so the position is part of its identity.
    <kbd key={`${token.value}-${index}`} data-key={token.value.toLowerCase()}>
      {children}
    </kbd>
  );
}

function isStoreEnabled(store: ShortcutStore) {
  return store.getState().enabled;
}

interface ShortcutHookResult {
  props: Props<TagName, ShortcutOptions>;
  ready: boolean;
}

function useShortcutProps({
  store: storeProp,
  keys: keysProp,
  command: commandProp,
  alwaysVisible = false,
  glyphs,
  keyNames,
  platform: platformProp,
  ...props
}: ShortcutProps): ShortcutHookResult {
  const context = useShortcutContext();
  const commandContext = useContext(UnstableShortcutCommandContext);
  const scopeContext = useContext(UnstableShortcutScopeContext);
  const [element, setElement] = useState<HTMLType | null>(null);
  const origin = getDocumentOrigin(element);
  const inheritedCommand =
    keysProp === undefined &&
    commandProp === undefined &&
    commandContext !== null
      ? commandContext
      : null;
  const store = storeProp ?? inheritedCommand?.store ?? context;
  const platform = useShortcutPlatform(store, platformProp);
  useShortcutRegistryVersion(store);

  let commandState;
  if (inheritedCommand) {
    commandState = store.unstable_getCommandState(inheritedCommand.id, origin);
  } else if (commandProp !== undefined) {
    commandState = store.unstable_getNamedCommandState(commandProp, origin);
  }

  let keys = "";
  if (keysProp !== undefined) {
    keys = keysProp ?? "";
  } else if (commandState) {
    keys = commandState.keys.join(" ");
  } else if (inheritedCommand) {
    keys = inheritedCommand.keys ?? "";
  } else if (commandProp !== undefined) {
    keys = store.getKeys(commandProp).join(" ");
  }

  const alternative = platform
    ? store.unstable_getKeyTokens(keys, {
        platform,
        glyphs,
        keyNames,
      })[0]
    : undefined;

  const localInScope =
    scopeContext === undefined
      ? true
      : store.unstable_isScopeActive(scopeContext, origin);
  const inScope =
    commandState?.inScope ??
    (inheritedCommand ? inheritedCommand.inScope : localInScope);
  const enabled =
    commandState?.enabled ??
    (inheritedCommand ? inheritedCommand.enabled : isStoreEnabled(store));
  const hidden = !enabled || (!alwaysVisible && !inScope);

  const children = alternative?.keys.map((token, index) => (
    <Fragment key={`${token.value}-${index}`}>
      {index > 0 ? alternative.joiner : null}
      {renderKeyToken(token, index)}
    </Fragment>
  ));

  props = {
    ...props,
    "aria-hidden": commandContext?.hasAriaKeyShortcuts
      ? true
      : props["aria-hidden"],
    children,
    dir: "ltr",
    "data-in-scope": inScope ? "" : undefined,
    ref: useMergeRefs(setElement, props.ref),
    style: hidden ? { ...props.style, visibility: "hidden" } : props.style,
  };

  return { props, ready: alternative !== undefined };
}

/** Returns props to render a platform-aware shortcut hint. */
export const useShortcut = createHook<TagName, ShortcutOptions>(
  function useShortcut(options) {
    return useShortcutProps(options).props;
  },
);

/**
 * Renders the first effective shortcut alternative as nested `kbd` elements.
 */
export const Shortcut = forwardRef(function Shortcut(props: ShortcutProps) {
  const result = useShortcutProps(props);
  const element = createElement(TagName, result.props);
  if (!result.ready) return null;
  return element;
});

export interface ShortcutOptions<
  _T extends ElementType = TagName,
> extends Options {
  /**
   * Canonical shortcuts to display. `undefined` falls back to the `command`
   * prop or surrounding `ShortcutCommand`; `null` suppresses both fallbacks.
   */
  keys?: string | null;
  /** Named command whose effective shortcut should be displayed. */
  command?: string;
  /**
   * Keeps the hint visible outside its active scope. Disabled stores and
   * commands still hide the hint.
   * @default false
   */
  alwaysVisible?: boolean;
  /** Per-key display glyph overrides. */
  glyphs?: ShortcutGlyphs;
  /** Per-key readable name overrides. */
  keyNames?: ShortcutKeyNames;
  /** Platform used to resolve and display the shortcut. */
  platform?: ShortcutPlatform;
  /** Shortcut store used to resolve the command and display configuration. */
  store?: ShortcutStore;
}

export type ShortcutProps<T extends ElementType = TagName> = Props<
  T,
  ShortcutOptions<T>
>;
