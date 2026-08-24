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
import { isElement } from "@ariakit/utils";
import type { ElementType } from "react";
import type { FocusEvent } from "react";
import { useContext, useRef, useState } from "react";
import {
  ShortcutContextProvider,
  UnstableShortcutScopeContext,
  useShortcutContext,
} from "./shortcut-context.tsx";
import type { ShortcutStore } from "./shortcut-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props for a focus region that descendant shortcut commands inherit.
 */
export const useShortcutScope = createHook<TagName, ShortcutScopeOptions>(
  function useShortcutScope({ store: storeProp, ...props }) {
    const context = useShortcutContext();
    const store = storeProp ?? context;
    const parent = useContext(UnstableShortcutScopeContext);
    const ref = useRef<HTMLType>(null);
    const [id] = useState<object>(() => ({}));
    const focusEpochsRef = useRef(new Map<Document, number>());
    const activeDocumentsRef = useRef(new Set<Document>());
    const documentCleanupsRef = useRef(new Map<Document, () => void>());
    const previousStoreRef = useRef(store);
    // Document capture can run before or after React's portal listener. Match
    // their targets so either order preserves logical focus.
    const logicalFocusTargetsRef = useRef(
      new Map<Document, EventTarget | null>(),
    );

    const clearActiveDocument = useEvent((document: Document) => {
      activeDocumentsRef.current.delete(document);
      logicalFocusTargetsRef.current.delete(document);
      store.unstable_clearActiveScope(id, document);
      documentCleanupsRef.current.get(document)?.();
      documentCleanupsRef.current.delete(document);
    });

    const clearCurrentStoreScopes = useEvent(() => {
      for (const document of activeDocumentsRef.current) {
        store.unstable_clearActiveScope(id, document);
      }
    });

    const scheduleDocumentClear = useEvent((document: Document) => {
      const epoch = (focusEpochsRef.current.get(document) ?? 0) + 1;
      focusEpochsRef.current.set(document, epoch);
      queueMicrotask(() => {
        if (focusEpochsRef.current.get(document) !== epoch) return;
        clearActiveDocument(document);
      });
    });

    const scheduleDocumentReconciliation = useEvent(
      (document: Document, target: EventTarget | null) => {
        const epoch = (focusEpochsRef.current.get(document) ?? 0) + 1;
        focusEpochsRef.current.set(document, epoch);
        queueMicrotask(() => {
          if (focusEpochsRef.current.get(document) !== epoch) return;
          if (logicalFocusTargetsRef.current.get(document) === target) return;
          clearActiveDocument(document);
        });
      },
    );

    const observeDocumentFocus = useEvent((document: Document) => {
      if (documentCleanupsRef.current.has(document)) return;
      const onFocusIn = (event: Event) => {
        scheduleDocumentReconciliation(document, event.target);
      };
      document.addEventListener("focusin", onFocusIn, true);
      documentCleanupsRef.current.set(document, () => {
        document.removeEventListener("focusin", onFocusIn, true);
      });
    });

    useSafeLayoutEffect(() => {
      const unregister = store.registerScope({
        unstable_id: id,
        unstable_getElement: () => ref.current,
        unstable_parent: parent ?? null,
      });
      for (const document of activeDocumentsRef.current) {
        store.unstable_setActiveScope(id, document);
      }
      return unregister;
    }, [store, id, parent]);

    useSafeLayoutEffect(() => {
      const previousStore = previousStoreRef.current;
      if (previousStore === store) return;
      previousStoreRef.current = store;
      for (const document of activeDocumentsRef.current) {
        previousStore.unstable_clearActiveScope(id, document);
        store.unstable_setActiveScope(id, document);
      }
    }, [store, id]);

    useSafeLayoutEffect(() => {
      const activeDocuments = activeDocumentsRef.current;
      const documentCleanups = documentCleanupsRef.current;
      return () => {
        clearCurrentStoreScopes();
        activeDocuments.clear();
        for (const cleanup of documentCleanups.values()) {
          cleanup();
        }
        documentCleanups.clear();
      };
    }, [clearCurrentStoreScopes]);

    const onFocusCaptureProp = props.onFocusCapture;
    const onFocusCapture = useEvent((event: FocusEvent<HTMLType>) => {
      onFocusCaptureProp?.(event);
      const document = isElement(event.target)
        ? event.target.ownerDocument
        : event.currentTarget.ownerDocument;
      logicalFocusTargetsRef.current.set(document, event.target);
      const epoch = focusEpochsRef.current.get(document) ?? 0;
      focusEpochsRef.current.set(document, epoch + 1);
      activeDocumentsRef.current.add(document);
      store.unstable_setActiveScope(id, document);
      observeDocumentFocus(document);
    });

    const onBlurCaptureProp = props.onBlurCapture;
    const onBlurCapture = useEvent((event: FocusEvent<HTMLType>) => {
      onBlurCaptureProp?.(event);
      const document = isElement(event.target)
        ? event.target.ownerDocument
        : event.currentTarget.ownerDocument;
      scheduleDocumentClear(document);
    });

    props = useWrapElement(
      props,
      (element) => (
        <ShortcutContextProvider value={store}>
          <UnstableShortcutScopeContext.Provider value={id}>
            {element}
          </UnstableShortcutScopeContext.Provider>
        </ShortcutContextProvider>
      ),
      [store, id],
    );

    props = {
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onFocusCapture,
      onBlurCapture,
    };

    return props;
  },
);

/**
 * Renders a focus region for descendant shortcut commands. Logical scope is
 * preserved when descendants render through portals.
 */
export const ShortcutScope = forwardRef(function ShortcutScope(
  props: ShortcutScopeProps,
) {
  const htmlProps = useShortcutScope(props);
  return createElement(TagName, htmlProps);
});

export interface ShortcutScopeOptions<
  _T extends ElementType = TagName,
> extends Options {
  /**
   * Shortcut store for this region. Descendants use the same store when this
   * option is provided.
   */
  store?: ShortcutStore;
}

export type ShortcutScopeProps<T extends ElementType = TagName> = Props<
  T,
  ShortcutScopeOptions<T>
>;
