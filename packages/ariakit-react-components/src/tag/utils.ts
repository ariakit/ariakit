import { isTouchDevice, toArray } from "@ariakit/utils";
import { useEffect, useState } from "react";

type Delimiter = string | RegExp;
type TagInputDelimiter = Delimiter | null | Delimiter[];

const DEFAULT_DELIMITER: Delimiter[] = ["\n", ";", ",", /\s/];

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
    let match = value.match(delimiter);
    // Remove delimiter from the start of the string
    while (match?.index === 0) {
      value = value.slice(match[0].length);
      match = value.match(delimiter);
    }
    if (!match) continue;
    return value.split(delimiter);
  }
  return [];
}

export function useTouchDevice() {
  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    setTouchDevice(isTouchDevice());
  }, []);

  return touchDevice;
}
