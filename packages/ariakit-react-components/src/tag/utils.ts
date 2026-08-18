import { isApple, isTouchDevice, toArray, UndoManager } from "@ariakit/utils";
import type { KeyboardEvent } from "react";
import { useEffect, useState } from "react";

type Delimiter = string | RegExp;
type TagInputDelimiter = Delimiter | null | Delimiter[];

const DEFAULT_DELIMITER: Delimiter[] = ["\n", ";", ",", /\s/];

interface DelimiterMatch {
  index?: number;
  length: number;
}

export function getDelimiters(
  delimiter: TagInputDelimiter | undefined,
  defaultDelimiter: TagInputDelimiter | undefined = DEFAULT_DELIMITER,
) {
  const finalDelimiter = delimiter === undefined ? defaultDelimiter : delimiter;
  if (!finalDelimiter) return [];
  return toArray(finalDelimiter);
}

export function splitValueByDelimiter(value: string, delimiters: Delimiter[]) {
  for (const delimiter of delimiters) {
    let match = matchDelimiter(value, delimiter);
    // Remove delimiter from the start of the string. Ignore zero-length matches
    // so patterns like /x*/ don't loop forever.
    while (match?.index === 0 && match.length > 0) {
      value = value.slice(match.length);
      match = matchDelimiter(value, delimiter);
    }
    if (!match) continue;
    return value.split(delimiter);
  }
  return [];
}

function matchDelimiter(
  value: string,
  delimiter: Delimiter,
): DelimiterMatch | null {
  if (typeof delimiter === "string") {
    // String delimiters are split literally, so they must be matched literally
    // instead of being compiled as regular expressions.
    const index = value.indexOf(delimiter);
    if (index === -1) return null;
    return { index, length: delimiter.length };
  }
  const match = value.match(delimiter);
  if (!match) return null;
  return { index: match.index, length: match[0].length };
}

/**
 * Runs undo/redo on the shared undo manager when the event matches the
 * platform's undo/redo shortcut. The tag list and the tag input are siblings,
 * so neither element can handle the shortcut on behalf of the other.
 */
export function handleUndoRedoShortcut(event: KeyboardEvent<HTMLElement>) {
  const pc = !isApple();
  const z = event.key === "z" || event.key === "Z";
  const mod = pc ? event.ctrlKey : event.metaKey;
  const shiftZ = (event.shiftKey && z) || (pc && event.key === "y");
  if (mod && shiftZ) {
    event.preventDefault();
    void UndoManager.redo();
  } else if (mod && z) {
    event.preventDefault();
    void UndoManager.undo();
  }
}

export function useTouchDevice() {
  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    setTouchDevice(isTouchDevice());
  }, []);

  return touchDevice;
}
