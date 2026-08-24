import type { ShortcutCommandOptions as CoreShortcutCommandOptions } from "@ariakit/components/shortcut/shortcut-store";
import {
  createElement,
  createHook,
  forwardRef,
  useEvent,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import {
  disabledFromElement,
  disabledFromProps,
  isElement,
} from "@ariakit/utils";
import type { ElementType, MouseEvent } from "react";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { withDefaultButtonType } from "../button/utils.ts";
import {
  useShortcutPlatform,
  useShortcutRegistryVersion,
  useStableShortcutScope,
} from "./__shortcut-store.ts";
import {
  UnstableShortcutCommandContext,
  UnstableShortcutScopeContext,
  useShortcutContext,
} from "./shortcut-context.tsx";
import type { ShortcutStore } from "./shortcut-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getComposedAncestors(element: Element) {
  const ancestors: Element[] = [];
  let current: Element | null = element;
  while (current) {
    ancestors.push(current);
    if (current.assignedSlot) {
      current = current.assignedSlot;
      continue;
    }
    if (current.parentElement) {
      current = current.parentElement;
      continue;
    }
    const root = current.getRootNode();
    if (!("host" in root)) break;
    const host = root.host as EventTarget | null;
    current = isElement(host) ? host : null;
  }
  return ancestors;
}

function isElementEnabled(element: Element) {
  if (!element.isConnected) return false;
  if (
    getComposedAncestors(element).some((ancestor) =>
      ancestor.hasAttribute("inert"),
    )
  ) {
    return false;
  }
  if (disabledFromElement(element)) return false;
  try {
    return !element.matches(":disabled");
  } catch (_error) {
    return true;
  }
}

function getFallbackKeys(
  store: ShortcutStore,
  command: string | undefined,
  keys: string | null | undefined,
) {
  if (command) {
    return store.unstable_getCommandKeys(command, keys);
  }
  if (!keys) return [];
  return store
    .unstable_getKeyTokens(keys)
    .map((alternative) => alternative.value);
}

// This component hook intentionally does not compose useCommand. Shortcut
// dispatch belongs to the document listener, while ordinary clicks are only
// bridged to the registered logical command.
const useShortcutCommand = createHook<TagName, ShortcutCommandOptions>(
  function useShortcutCommand({
    store: storeProp,
    command,
    keys,
    onTrigger: onTriggerProp,
    preventDefault,
    scope: scopeProp,
    enabled = true,
    enabledInTextbox,
    ...props
  }) {
    const context = useShortcutContext();
    const store = storeProp ?? context;
    const scopeContext = useContext(UnstableShortcutScopeContext);
    const scope = useStableShortcutScope(scopeProp);
    const [id] = useState<object>(() => ({}));
    const ref = useRef<HTMLType>(null);
    const [element, setElement] = useState<Element | null>(null);
    const [elementEnabled, setElementEnabled] = useState(true);
    const setElementRef = useCallback((element: HTMLType | null) => {
      setElement(element);
    }, []);
    const getElement = useCallback(() => ref.current, []);

    const enabledFromProps = enabled && !disabledFromProps(props);
    const effectiveEnabled = enabledFromProps && elementEnabled;
    const hasOnTrigger = onTriggerProp !== undefined;
    const onTrigger = useEvent(onTriggerProp);
    const preventDefaultEvent = useEvent(
      typeof preventDefault === "function" ? preventDefault : undefined,
    );
    const enabledInTextboxEvent = useEvent(
      typeof enabledInTextbox === "function" ? enabledInTextbox : undefined,
    );
    preventDefault =
      typeof preventDefault === "function"
        ? preventDefaultEvent
        : preventDefault;
    enabledInTextbox =
      typeof enabledInTextbox === "function"
        ? enabledInTextboxEvent
        : enabledInTextbox;
    const hasDeclaration =
      command === undefined ||
      keys !== undefined ||
      hasOnTrigger ||
      preventDefault !== undefined ||
      enabledInTextbox !== undefined;
    const unstableScope =
      scope === undefined && hasDeclaration ? scopeContext : undefined;

    useSafeLayoutEffect(() => {
      return store.registerCommand({
        command,
        keys,
        onTrigger: hasOnTrigger ? onTrigger : undefined,
        preventDefault,
        scope,
        enabled: effectiveEnabled,
        enabledInTextbox,
        unstable_id: id,
        unstable_getElement: getElement,
        unstable_scope: unstableScope,
      });
    }, [
      store,
      command,
      keys,
      hasOnTrigger,
      onTrigger,
      preventDefault,
      scope,
      effectiveEnabled,
      enabledInTextbox,
      id,
      getElement,
      unstableScope,
    ]);

    useSafeLayoutEffect(() => {
      if (!element) return;
      const commandElement = element;
      const syncEnabled = () =>
        setElementEnabled(isElementEnabled(commandElement));
      syncEnabled();
      const MutationObserverConstructor =
        commandElement.ownerDocument.defaultView?.MutationObserver;
      if (!MutationObserverConstructor) return;

      let slots: Element[] = [];
      const observer = new MutationObserverConstructor(rebind);

      function clearSlotListeners() {
        for (const slot of slots) {
          slot.removeEventListener("slotchange", rebind);
        }
        slots = [];
      }

      function rebind() {
        observer.disconnect();
        clearSlotListeners();
        const roots = new Set<Node>();
        const ancestors = getComposedAncestors(commandElement);
        for (const ancestor of ancestors) {
          observer.observe(ancestor, {
            attributes: true,
            attributeFilter: [
              "aria-disabled",
              "disabled",
              "inert",
              "name",
              "slot",
            ],
            childList: true,
          });
          if (ancestor.localName === "slot") {
            ancestor.addEventListener("slotchange", rebind);
            slots.push(ancestor);
          }
          const root = ancestor.getRootNode();
          if ("host" in root) roots.add(root);
          if (ancestor.shadowRoot) roots.add(ancestor.shadowRoot);
        }
        for (const root of roots) {
          observer.observe(root, {
            attributes: true,
            attributeFilter: ["name", "slot"],
            childList: true,
            subtree: true,
          });
        }
        syncEnabled();
      }

      rebind();
      return () => {
        observer.disconnect();
        clearSlotListeners();
      };
    }, [element]);

    useShortcutRegistryVersion(store);
    const commandState = store.unstable_getCommandState(id);
    const platform = useShortcutPlatform(store);
    const fallbackKeys = getFallbackKeys(store, command, keys);
    const fallbackKeysValue = keys === null ? null : fallbackKeys.join(" ");
    const commandEnabled =
      commandState?.enabled ?? (store.getState().enabled && effectiveEnabled);
    const inScope = commandState?.inScope ?? true;
    const ariaKeyShortcuts = platform
      ? (commandState?.ariaKeyShortcuts ??
        (commandEnabled ? fallbackKeys[0] : undefined))
      : undefined;

    const onClickProp = props.onClick;
    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (!effectiveEnabled) return;
      if (!isElementEnabled(event.currentTarget)) return;
      if (store.unstable_isSyntheticClick(event.nativeEvent)) return;
      store.unstable_triggerCommand(id, event.nativeEvent);
    });

    const commandContextValue = useMemo(
      () => ({
        id,
        command,
        keys: fallbackKeysValue,
        enabled: commandEnabled,
        inScope,
        hasAriaKeyShortcuts: !!ariaKeyShortcuts && commandEnabled,
        store,
      }),
      [
        id,
        command,
        fallbackKeysValue,
        commandEnabled,
        inScope,
        ariaKeyShortcuts,
        store,
      ],
    );
    props = useWrapElement(
      props,
      (element) => (
        <UnstableShortcutCommandContext.Provider value={commandContextValue}>
          {element}
        </UnstableShortcutCommandContext.Provider>
      ),
      [commandContextValue],
    );

    props = {
      ...props,
      "aria-keyshortcuts": commandEnabled ? ariaKeyShortcuts : undefined,
      "data-in-scope": inScope ? "" : undefined,
      ref: useMergeRefs(ref, setElementRef, props.ref),
      onClick,
    };

    return props;
  },
);

/**
 * Renders a reference element for a shortcut command. Keyboard activation is
 * handled by the shortcut store's document dispatcher.
 */
export const ShortcutCommand = forwardRef(function ShortcutCommand(
  props: ShortcutCommandProps,
) {
  const htmlProps = useShortcutCommand(withDefaultButtonType(props));
  return createElement(TagName, htmlProps);
});

export interface ShortcutCommandOptions<_T extends ElementType = TagName>
  extends
    Options,
    Omit<
      CoreShortcutCommandOptions,
      "store" | "unstable_id" | "unstable_getElement" | "unstable_scope"
    > {
  /**
   * Whether this registration participates in activation. A disabled,
   * aria-disabled, or inert rendered element also disables its reference.
   * @default true
   */
  enabled?: boolean;
  /** Shortcut store used for this reference. */
  store?: ShortcutStore;
}

export type ShortcutCommandProps<T extends ElementType = TagName> = Props<
  T,
  ShortcutCommandOptions<T>
>;
