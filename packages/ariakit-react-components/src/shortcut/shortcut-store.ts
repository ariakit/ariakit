import * as Core from "@ariakit/components/shortcut/shortcut-store";
import { useStoreProps } from "@ariakit/react-store";
import type { Store } from "@ariakit/react-store";
import {
  useEvent,
  useSafeLayoutEffect,
  useUpdateEffect,
} from "@ariakit/react-utils";
import { init } from "@ariakit/store";
import { useContext, useMemo, useState } from "react";
import {
  bindReactShortcutStore,
  useShortcutRegistryVersion,
  useStableShortcutScope,
} from "./__shortcut-store.ts";
import {
  UnstableShortcutScopeContext,
  useShortcutContext,
  useShortcutProviderContext,
} from "./shortcut-context.tsx";

function isReactShortcutStore(
  store: Core.ShortcutStore,
): store is ShortcutStore {
  return "useState" in store && typeof store.useState === "function";
}

/**
 * Registers a headless shortcut command. The registration is removed when the
 * component unmounts, while its trigger callback always reads the latest
 * render.
 */
export function useShortcutCommand(
  /** Shortcut command registration options. */
  props: UseShortcutCommandOptions,
) {
  const context = useShortcutContext();
  const store = props.store ?? context;
  const scopeContext = useContext(UnstableShortcutScopeContext);
  const [id] = useState<object>(() => ({}));
  const hasOnTrigger = props.onTrigger !== undefined;
  const onTrigger = useEvent(props.onTrigger);
  const preventDefaultEvent = useEvent(
    typeof props.preventDefault === "function"
      ? props.preventDefault
      : undefined,
  );
  const preventDefault =
    typeof props.preventDefault === "function"
      ? preventDefaultEvent
      : props.preventDefault;
  const enabledInTextboxEvent = useEvent(
    typeof props.enabledInTextbox === "function"
      ? props.enabledInTextbox
      : undefined,
  );
  const enabledInTextbox =
    typeof props.enabledInTextbox === "function"
      ? enabledInTextboxEvent
      : props.enabledInTextbox;
  const scope = useStableShortcutScope(props.scope);
  const hasDeclaration =
    props.command === undefined ||
    props.keys !== undefined ||
    hasOnTrigger ||
    props.preventDefault !== undefined ||
    props.enabledInTextbox !== undefined;
  const unstableScope =
    scope === undefined && hasDeclaration ? scopeContext : undefined;

  useSafeLayoutEffect(() => {
    return store.registerCommand({
      command: props.command,
      keys: props.keys,
      onTrigger: hasOnTrigger ? onTrigger : undefined,
      preventDefault,
      scope,
      enabled: props.enabled,
      enabledInTextbox,
      unstable_id: id,
      unstable_scope: unstableScope,
    });
  }, [
    store,
    id,
    props.command,
    props.keys,
    hasOnTrigger,
    onTrigger,
    preventDefault,
    scope,
    props.enabled,
    enabledInTextbox,
    unstableScope,
  ]);
}

function getShortcutKeys(
  store: ShortcutStore,
  command: string,
  _version: number,
) {
  return store.getKeys(command);
}

/** Returns the effective canonical alternatives for a named command. */
export function useShortcutKeys(
  /** Named shortcut lookup options. */
  props: UseShortcutKeysOptions,
): string[] {
  const context = useShortcutContext();
  const store = props.store ?? context;
  const version = useShortcutRegistryVersion(store);
  return useMemo(
    () => getShortcutKeys(store, props.command, version),
    [store, props.command, version],
  );
}

export function useShortcutStoreProps<T extends Core.ShortcutStore>(
  store: T,
  update: () => void,
  props: ShortcutStoreProps,
  parent?: ShortcutStore,
) {
  useUpdateEffect(update, [
    parent,
    props.store,
    props.platform !== undefined,
    props.glyphs !== undefined,
    props.keyNames !== undefined,
    update,
  ]);
  useStoreProps(store, props, "enabled");
  useStoreProps(store, props, "platform");
  useStoreProps(store, props, "glyphs");
  useStoreProps(store, props, "keyNames");
  useStoreProps(store, props, "keys");
  return store;
}

interface ShortcutStoreRecord {
  store: Core.ShortcutStore;
  owned: boolean;
  parent: ShortcutStore | undefined;
  hasPlatform: boolean;
  hasGlyphs: boolean;
  hasKeyNames: boolean;
}

/**
 * Creates a shortcut store. Nested stores inherit their parent provider's
 * display configuration and participate in the same shortcut hierarchy.
 */
export function useShortcutStore(
  props: ShortcutStoreProps = {},
): ShortcutStore {
  const parent = useShortcutProviderContext();
  const externalStore = props.store?.unstable_getStore();
  const coreProps = {
    ...props,
    unstable_parent: parent,
    unstable_deferActivation: true,
  };
  const createRecord = (
    store: Core.ShortcutStore,
    owned: boolean,
  ): ShortcutStoreRecord => ({
    store,
    owned,
    parent,
    hasPlatform: props.platform !== undefined,
    hasGlyphs: props.glyphs !== undefined,
    hasKeyNames: props.keyNames !== undefined,
  });
  const createOwnedRecord = () => {
    const store = Core.createShortcutStore({
      ...coreProps,
      store: undefined,
    });
    return createRecord(store, true);
  };
  const isOwnedRecordCurrent = (record: ShortcutStoreRecord) => {
    if (!record.owned) return false;
    if (record.parent !== parent) return false;
    if (record.hasPlatform !== (props.platform !== undefined)) return false;
    if (record.hasGlyphs !== (props.glyphs !== undefined)) return false;
    if (record.hasKeyNames !== (props.keyNames !== undefined)) return false;
    return true;
  };
  const getNextRecord = (record: ShortcutStoreRecord) => {
    if (externalStore) {
      const usesExternalStore = !record.owned && record.store === externalStore;
      if (usesExternalStore) return;
      return createRecord(externalStore, false);
    }
    if (isOwnedRecordCurrent(record)) return;
    return createOwnedRecord();
  };
  let [record, setRecord] = useState<ShortcutStoreRecord>(() => {
    if (externalStore) return createRecord(externalStore, false);
    return createOwnedRecord();
  });
  const nextRecord = getNextRecord(record);
  if (nextRecord) {
    setRecord(nextRecord);
    record = nextRecord;
  }

  useSafeLayoutEffect(() => {
    if (!record.owned) return;
    return init(record.store);
  }, [record]);

  const update = useEvent(() => {
    setRecord((current) => {
      return getNextRecord(current) ?? current;
    });
  });

  const createdStore = useMemo(
    () => bindReactShortcutStore(record.store),
    [record.store],
  );
  const store =
    props.store && isReactShortcutStore(props.store)
      ? props.store
      : createdStore;
  return useShortcutStoreProps(store, update, props, parent);
}

export interface ShortcutStoreState extends Core.ShortcutStoreState {}

export interface ShortcutStoreFunctions extends Core.ShortcutStoreFunctions {}

export interface ShortcutStoreOptions extends Omit<
  Core.ShortcutStoreOptions,
  "unstable_parent" | "unstable_deferActivation"
> {}

export interface ShortcutStoreProps extends ShortcutStoreOptions {
  /**
   * Existing shortcut store to provide without creating another registry
   * level.
   */
  store?: Core.ShortcutStore | null;
}

export interface ShortcutStore
  extends ShortcutStoreFunctions, Store<Core.ShortcutStore> {}

export interface UseShortcutCommandOptions extends Omit<
  Core.ShortcutCommandOptions,
  "store" | "unstable_id" | "unstable_getElement" | "unstable_scope"
> {
  /** Shortcut store used for this registration. */
  store?: ShortcutStore;
}

export interface UseShortcutKeysOptions {
  /** Named shortcut command to read. */
  command: string;
  /** Shortcut store that owns the command. */
  store?: ShortcutStore;
}

export type {
  ShortcutEvent,
  ShortcutFormatOptions,
  ShortcutGlyphs,
  ShortcutKeyNames,
  ShortcutPlatform,
  ShortcutScopeRef,
} from "@ariakit/components/shortcut/shortcut-store";
