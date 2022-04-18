import {
  ChangeEvent,
  MouseEvent,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { autoUpdate } from "@floating-ui/dom";
import { useSafeLayoutEffect } from "ariakit-utils/hooks";
import {
  Combobox,
  ComboboxCancel,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import getCaretCoordinates from "textarea-caret";
import "./style.css";

const list = [
  "_huygn",
  "_prisis_",
  "airuyi",
  "clementloridan",
  "CParadaTech",
  "danarocha_",
  "danielolaviobr",
  "daniguardio_la",
  "donysukardi",
  "drudunn",
  "fabiogiolito",
  "gildaspk",
  "GorgeVillalobos",
  "hybrid_alex",
  "itsJonQ",
  "JSomsanith",
  "lucasmogari",
  "neoziro",
  "NgoakoRamz",
  "refuse2choose",
  "ricomadiko",
  "ruijdacd",
  "sseraphini",
  "yagopereiraaz",
];

export default function Example() {
  const positionRef = useRef(0);
  const [value, setValue] = useState("");
  const combobox = useComboboxState({
    list,
    fitViewport: true,
    getAnchorRect: (element) => {
      if (!element) return null;
      const caretPosition = positionRef.current;
      const { left, top, height } = getCaretCoordinates(element, caretPosition);
      const { x, y } = element.getBoundingClientRect();
      return { x: left + x, y: top + y, height };
    },
  });

  const changedRef = useRef(false);

  useEffect(() => {
    const element = combobox.baseRef.current;
    if (!element) return;
    const doc = element.ownerDocument;
    const onSelect = () => {
      if (doc.activeElement === element) {
        const changed = changedRef.current;
        changedRef.current = false;
        if (!changed) {
          combobox.hide();
        }
      }
    };
    doc.addEventListener("selectionchange", onSelect);
    return () => {
      doc.removeEventListener("selectionchange", onSelect);
    };
  }, []);

  return (
    <div>
      <label className="label">
        Comment
        <Combobox
          as="textarea"
          state={combobox}
          className="combobox"
          autoSelect
          rows={5}
          value={value}
          onMouseDown={combobox.hide}
          showOnChange={false}
          showOnKeyDown={false}
          showOnMouseDown={false}
          setValueOnChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            const { value, selectionEnd, selectionStart } = event.target;
            changedRef.current = true;
            setValue(value);
            const previousChar = value[selectionStart - 1];
            const secondPreviousChar = value[selectionStart - 2];
            if (
              previousChar === "@" &&
              (!secondPreviousChar || secondPreviousChar === " ")
            ) {
              positionRef.current = selectionStart;
              combobox.show();
            } else {
              const val = value
                .slice(0, selectionStart)
                .split(/[^\p{Letter}\p{Number}@#_]/u);
              const lastWord = val[val.length - 1];
              if (!lastWord?.startsWith("@")) {
                combobox.hide();
              }
            }

            const val = value
              .slice(0, selectionEnd)
              .split(/[^\p{Letter}\p{Number}@#_]/u);

            const lastWord = val[val.length - 1];

            if (lastWord?.startsWith("@")) {
              const word = lastWord.slice(1);
              combobox.setValue(word);
            }

            return false;
          }}
        />
      </label>
      {combobox.mounted && !!combobox.matches.length && (
        <ComboboxPopover state={combobox} className="popover">
          {combobox.matches.map((value) => (
            <ComboboxItem
              key={value}
              value={value}
              setValueOnClick={(event) => {
                const position = positionRef.current;
                requestAnimationFrame(() => {
                  const textarea = combobox.baseRef
                    .current as HTMLTextAreaElement;
                  const length = position + value.length + 1;
                  textarea.setSelectionRange(length, length);
                });
                setValue((prevValue) => {
                  return (
                    prevValue.slice(0, position) +
                    value +
                    " " +
                    prevValue.slice(position + combobox.value.length)
                  );
                });
                return true;
              }}
              className="combobox-item"
            />
          ))}
        </ComboboxPopover>
      )}
    </div>
  );
}
