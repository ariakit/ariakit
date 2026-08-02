import { useStoreState } from "@ariakit/react-store";
import { subscribe } from "@ariakit/store";
import { getDocument } from "@ariakit/utils";
import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import {
  getFocusActiveElement,
  scheduleFocusPresentation,
} from "../focusable/focus-presentation.tsx";
import type { SelectStore } from "../select/select-store.ts";
import type { ComboboxStore } from "./combobox-store.ts";

interface OpeningPresentationItem {
  id: string;
  element?: HTMLElement | null;
  disabled?: boolean;
  value?: string;
}

interface OpeningPresentationState {
  open: boolean;
  moves: number;
  activeId: string | null | undefined;
  items: readonly OpeningPresentationItem[];
  selectedValue: string | readonly string[];
  baseElement: HTMLElement | null;
  inputElement: HTMLElement | null;
  selectElement: HTMLElement | null;
  contentElement: HTMLElement | null;
}

interface OpeningPresentationStore {
  getState(): OpeningPresentationState;
  subscribe(listener: () => void): () => void;
}

function createComboboxPresentationStore(
  store: ComboboxStore,
): OpeningPresentationStore {
  return {
    getState() {
      const state = store.getState();
      return {
        open: state.open,
        moves: state.moves,
        activeId: state.activeId,
        items: state.items,
        selectedValue: state.selectedValue,
        baseElement: state.baseElement,
        inputElement: state.inputElement,
        selectElement: state.selectElement,
        contentElement: state.contentElement,
      };
    },
    subscribe(listener) {
      return subscribe(
        store,
        [
          "open",
          "moves",
          "activeId",
          "items",
          "selectedValue",
          "baseElement",
          "inputElement",
          "selectElement",
          "contentElement",
        ],
        listener,
      );
    },
  };
}

function createSelectPresentationStore(
  store: SelectStore,
): OpeningPresentationStore {
  return {
    getState() {
      const state = store.getState();
      return {
        open: state.open,
        moves: state.moves,
        activeId: state.activeId,
        items: state.items,
        selectedValue: state.value,
        baseElement: state.baseElement,
        inputElement: null,
        selectElement: state.selectElement,
        contentElement: state.contentElement,
      };
    },
    subscribe(listener) {
      return subscribe(
        store,
        [
          "open",
          "moves",
          "activeId",
          "items",
          "value",
          "baseElement",
          "selectElement",
          "contentElement",
        ],
        listener,
      );
    },
  };
}

function getSelectedValue(value: string | readonly string[]) {
  if (!Array.isArray(value)) return value;
  return value.at(-1);
}

function copySelectedValue(value: string | readonly string[]) {
  if (!Array.isArray(value)) return value;
  return [...value];
}

function selectedValuesEqual(
  value: string | readonly string[],
  expected: string | readonly string[],
) {
  if (!Array.isArray(value)) return value === expected;
  if (!Array.isArray(expected)) return false;
  if (value.length !== expected.length) return false;
  return value.every((item, index) => item === expected[index]);
}

function scheduleOpeningSelectedItemPresentation(
  store: OpeningPresentationStore | null,
  popupRef: RefObject<HTMLElement | null>,
) {
  if (!store) return;
  const initialState = store.getState();
  if (!initialState.open) return;

  const openingSelectedValue = copySelectedValue(initialState.selectedValue);
  const selectedValue = getSelectedValue(openingSelectedValue);
  const openingMoves = initialState.moves;
  const openingActiveId = initialState.activeId;
  const focusReference =
    initialState.selectElement ||
    initialState.inputElement ||
    initialState.baseElement ||
    popupRef.current ||
    initialState.contentElement;
  const initialActiveElement = getFocusActiveElement(focusReference);

  const getSelectedItem = (state: OpeningPresentationState) => {
    if (selectedValue === undefined) return;
    return state.items.find(
      (item) => !item.disabled && item.value === selectedValue,
    );
  };
  let openingSelect: HTMLElement | null = null;

  const isOpeningLifecycleValid = (state: OpeningPresentationState) => {
    if (!state.open) return false;
    if (state.moves !== openingMoves) return false;
    if (!selectedValuesEqual(state.selectedValue, openingSelectedValue)) {
      return false;
    }
    if (openingSelect && state.selectElement !== openingSelect) return false;
    return true;
  };

  const canPresentWithCurrentFocus = (state: OpeningPresentationState) => {
    const activeElement = getFocusActiveElement(focusReference);
    const selectedItem = getSelectedItem(state);
    const selectedId = selectedItem?.id;
    const openingItemIsActive = state.activeId === openingActiveId;
    const selectedItemIsActive =
      selectedId !== undefined && state.activeId === selectedId;

    if (activeElement === initialActiveElement) {
      return openingItemIsActive || selectedItemIsActive;
    }
    if (
      (!!state.inputElement &&
        getFocusActiveElement(state.inputElement) === state.inputElement) ||
      (!!state.baseElement &&
        getFocusActiveElement(state.baseElement) === state.baseElement)
    ) {
      return (
        state.activeId === null || openingItemIsActive || selectedItemIsActive
      );
    }
    return (
      !!selectedItem?.element &&
      getFocusActiveElement(selectedItem.element) === selectedItem.element &&
      selectedItemIsActive
    );
  };

  const documents = new Set<Document>();
  let retryPresentation = () => {};
  const onFocusIn = () => retryPresentation();

  const listenToDocument = (element: HTMLElement | null | undefined) => {
    if (!element) return;
    const doc = getDocument(element);
    if (documents.has(doc)) return;
    documents.add(doc);
    doc.addEventListener("focusin", onFocusIn, true);
  };

  const listenToCurrentDocuments = () => {
    const state = store.getState();
    listenToDocument(initialActiveElement);
    listenToDocument(state.selectElement);
    listenToDocument(state.inputElement);
    listenToDocument(state.baseElement);
    listenToDocument(state.contentElement);
    listenToDocument(popupRef.current);
    listenToDocument(getSelectedItem(state)?.element);
  };

  const getTarget = () => {
    const state = store.getState();
    const selectElement = state.selectElement;
    if (!selectElement?.isConnected) return null;
    const item = getSelectedItem(state);
    const element = item?.element;
    if (!element?.isConnected) return null;
    openingSelect ||= selectElement;
    return element;
  };

  const isValid = () => {
    const state = store.getState();
    return isOpeningLifecycleValid(state);
  };

  return scheduleFocusPresentation({
    getTarget,
    getScopeTarget: () => popupRef.current,
    subscribe(retry) {
      retryPresentation = retry;
      listenToCurrentDocuments();
      const unsubscribe = store.subscribe(() => {
        listenToCurrentDocuments();
        retryPresentation();
      });
      return () => {
        unsubscribe();
        for (const doc of documents) {
          doc.removeEventListener("focusin", onFocusIn, true);
        }
      };
    },
    isValid,
    settle: () => canPresentWithCurrentFocus(store.getState()),
    scroll: "center",
    requireScope: true,
    requireTargetScope: true,
  });
}

function useOpeningSelectedItemPresentation(
  open: boolean,
  store: OpeningPresentationStore | null,
  popupRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    return scheduleOpeningSelectedItemPresentation(store, popupRef);
  }, [open, store, popupRef]);
}

export function useComboboxPopoverPresentation(store?: ComboboxStore | null) {
  const popupRef = useRef<HTMLElement | null>(null);
  const open = !!useStoreState(store, "open");
  const presentationStore = useMemo(
    () => (store ? createComboboxPresentationStore(store) : null),
    [store],
  );
  useOpeningSelectedItemPresentation(open, presentationStore, popupRef);
  return popupRef;
}

export function useSelectPopoverPresentation(store?: SelectStore | null) {
  const popupRef = useRef<HTMLElement | null>(null);
  const open = !!useStoreState(store, "open");
  const presentationStore = useMemo(
    () => (store ? createSelectPresentationStore(store) : null),
    [store],
  );
  useOpeningSelectedItemPresentation(open, presentationStore, popupRef);
  return popupRef;
}
