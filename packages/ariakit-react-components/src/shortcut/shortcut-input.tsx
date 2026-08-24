import {
  createElement,
  createHook,
  forwardRef,
  useEvent,
  useLiveRef,
  useSafeLayoutEffect,
  useWrapElement,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import type {
  ChangeEvent,
  ElementType,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";
import { useState } from "react";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";
import {
  useShortcutPlatform,
  useShortcutRegistryVersion,
} from "./__shortcut-store.ts";
import { useShortcutContext } from "./shortcut-context.tsx";
import type { ShortcutStore } from "./shortcut-store.ts";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getModifierProgress(event: KeyboardEvent) {
  const modifiers: string[] = [];
  if (event.getModifierState("Control")) modifiers.push("Control");
  if (event.getModifierState("Alt")) modifiers.push("Alt");
  if (event.getModifierState("Shift")) modifiers.push("Shift");
  if (event.getModifierState("Meta")) modifiers.push("Meta");
  return modifiers.join("+");
}

function isAltGraph(event: KeyboardEvent) {
  if (event.key.toLowerCase() === "altgraph") return true;
  return event.getModifierState("AltGraph");
}

function isConfiguredKey(
  store: ShortcutStore,
  configuredKeys: string | null,
  eventKeys: string,
) {
  if (configuredKeys === null) return false;
  return store
    .unstable_getKeyTokens(configuredKeys)
    .some((alternative) => alternative.value === eventKeys);
}

function formatModifierProgress(
  store: ShortcutStore,
  keys: string,
  platform: NonNullable<ReturnType<typeof useShortcutPlatform>>,
) {
  const alternative = store.unstable_getKeyTokens(`${keys}+A`, { platform })[0];
  if (!alternative) return "";
  return alternative.keys
    .slice(0, -1)
    .map((key) => key.text)
    .join(alternative.joiner);
}

function formatRecordingAnnouncement(
  store: ShortcutStore,
  keys: string,
  platform: ReturnType<typeof useShortcutPlatform>,
) {
  const alternative = store.unstable_getKeyTokens(
    keys,
    platform ? { platform } : undefined,
  )[0];
  if (!alternative) return "";
  return alternative.keys.map((key) => key.name ?? key.text).join(" + ");
}

/** Returns props for a shortcut recording input. */
export const useShortcutInput = createHook<TagName, ShortcutInputOptions>(
  function useShortcutInput({
    store: storeProp,
    keys: keysProp,
    defaultKeys = "",
    setKeys: setKeysProp,
    recording: recordingProp,
    setRecording: setRecordingProp,
    cancelKeys = "Escape",
    clearKeys = "Backspace Delete",
    ...props
  }) {
    const context = useShortcutContext();
    const store = storeProp ?? context;
    const platform = useShortcutPlatform(store);
    useShortcutRegistryVersion(store);
    const [uncontrolledKeys, setUncontrolledKeys] = useState<string | null>(
      defaultKeys,
    );
    const [uncontrolledRecording, setUncontrolledRecording] = useState(false);
    const [progress, setProgress] = useState("");
    const [announcement, setAnnouncement] = useState("");
    const recording = recordingProp ?? uncontrolledRecording;
    const keys = keysProp === undefined ? uncontrolledKeys : keysProp;
    const recordingRef = useLiveRef(recording);

    useSafeLayoutEffect(() => {
      if (recording) return;
      setProgress("");
    }, [recording]);

    const setKeys = useEvent((nextKeys: string | null) => {
      if (keysProp === undefined) {
        setUncontrolledKeys(nextKeys);
      }
      setKeysProp?.(nextKeys);
    });

    const setRecording = useEvent((nextRecording: boolean) => {
      if (recordingProp === undefined) {
        recordingRef.current = nextRecording;
        setUncontrolledRecording(nextRecording);
      }
      setRecordingProp?.(nextRecording);
      if (!nextRecording) {
        setProgress("");
      }
    });

    const startRecording = () => {
      if (recordingRef.current) return;
      setAnnouncement("");
      setRecording(true);
    };

    const onFocusProp = props.onFocus;
    const onFocus = useEvent((event: FocusEvent<HTMLType>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      startRecording();
    });

    const onClickProp = props.onClick;
    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      startRecording();
    });

    const onBlurProp = props.onBlur;
    const onBlur = useEvent((event: FocusEvent<HTMLType>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      if (!recordingRef.current) return;
      setRecording(false);
    });

    const onChangeProp = props.onChange;
    const onChange = useEvent((event: ChangeEvent<HTMLType>) => {
      onChangeProp?.(event);
    });

    const onKeyDownProp = props.onKeyDown;
    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!recordingRef.current) return;
      if (event.key === "Tab") return;
      const nativeEvent = event.nativeEvent;
      if (nativeEvent.isComposing) return;
      // AltGraph often reports Control+Alt, which is not recording progress.
      if (isAltGraph(event)) {
        setProgress("");
        return;
      }
      const eventKeys = store.unstable_getEventKeys(nativeEvent);
      if (!eventKeys) {
        const modifierProgress = getModifierProgress(event);
        if (!modifierProgress) return;
        event.preventDefault();
        setProgress(modifierProgress);
        return;
      }
      if (isConfiguredKey(store, cancelKeys, eventKeys)) {
        event.preventDefault();
        setRecording(false);
        return;
      }
      if (isConfiguredKey(store, clearKeys, eventKeys)) {
        event.preventDefault();
        setKeys(null);
        setRecording(false);
        return;
      }
      event.preventDefault();
      setKeys(eventKeys);
      setRecording(false);
      setAnnouncement(formatRecordingAnnouncement(store, eventKeys, platform));
    });

    const onKeyUpProp = props.onKeyUp;
    const onKeyUp = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyUpProp?.(event);
      if (event.defaultPrevented) return;
      if (!recordingRef.current) return;
      if (event.nativeEvent.isComposing) return;
      if (isAltGraph(event)) {
        setProgress("");
        return;
      }
      setProgress(getModifierProgress(event));
    });

    let displayValue = "";
    if (recording && platform && progress) {
      displayValue = formatModifierProgress(store, progress, platform);
    } else if (platform && keys) {
      displayValue = store.formatKeys(keys, { platform });
    }

    props = useWrapElement(
      props,
      (element) => (
        <>
          {element}
          <VisuallyHidden aria-live="polite" aria-atomic="true">
            {announcement}
          </VisuallyHidden>
        </>
      ),
      [announcement],
    );

    props = {
      ...props,
      value: displayValue,
      readOnly: !recording,
      "data-shortcut-recording": recording ? "" : undefined,
      onFocus,
      onClick,
      onBlur,
      onChange,
      onKeyDown,
      onKeyUp,
    };

    return props;
  },
);

/**
 * Renders an input that records one canonical shortcut chord at a time.
 */
export const ShortcutInput = forwardRef(function ShortcutInput(
  props: ShortcutInputProps,
) {
  const htmlProps = useShortcutInput(props);
  return createElement(TagName, htmlProps);
});

export interface ShortcutInputOptions<
  _T extends ElementType = TagName,
> extends Options {
  /** Controlled canonical shortcut value. */
  keys?: string;
  /** Initial canonical shortcut value. @default "" */
  defaultKeys?: string;
  /** Called with a canonical shortcut, or `null` when it is cleared. */
  setKeys?: (keys: string | null) => void;
  /** Whether the input is recording. @default false */
  recording?: boolean;
  /** Called when recording starts or stops. */
  setRecording?: (recording: boolean) => void;
  /**
   * Shortcuts that cancel recording. `null` makes them recordable.
   * @default "Escape"
   */
  cancelKeys?: string | null;
  /**
   * Shortcuts that clear the value. `null` makes them recordable.
   * @default "Backspace Delete"
   */
  clearKeys?: string | null;
  /** Shortcut store used for normalization and display. */
  store?: ShortcutStore;
}

export type ShortcutInputProps<T extends ElementType = TagName> = Props<
  T,
  ShortcutInputOptions<T>
>;
