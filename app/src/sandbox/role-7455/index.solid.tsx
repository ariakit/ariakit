import { As, Role } from "@ariakit/solid";
import { createSignal } from "solid-js";

export default function Example() {
  const [keyboard, setKeyboard] = createSignal<HTMLElement | null>(null);
  const [separator, setSeparator] = createSignal<HTMLHRElement | null>(null);
  const [time, setTime] = createSignal<HTMLTimeElement | null>(null);
  const [cell, setCell] = createSignal<HTMLTableCellElement | null>(null);
  const [fieldset, setFieldset] = createSignal<HTMLFieldSetElement | null>(
    null,
  );
  const [option, setOption] = createSignal<HTMLOptionElement | null>(null);
  const [composed, setComposed] = createSignal<HTMLElement | null>(null);

  const [elementRefs, setElementRefs] = createSignal("Not inspected");
  const [composedRef, setComposedRef] = createSignal("Not inspected");

  return (
    <Role.article>
      <Role.h1>Keyboard commands</Role.h1>
      <Role.kbd ref={setKeyboard} title="Command K">
        ⌘K
      </Role.kbd>
      <Role.hr ref={setSeparator} aria-label="Commands" />
      <Role.time ref={setTime} dateTime="2026-09-09">
        September 9
      </Role.time>
      <Role.table>
        <Role.caption>Commands</Role.caption>
        <Role.tbody>
          <Role.tr>
            <Role.td ref={setCell} colSpan={2}>
              Open search
            </Role.td>
          </Role.tr>
        </Role.tbody>
      </Role.table>
      <Role.fieldset ref={setFieldset} disabled>
        <Role.legend>Settings</Role.legend>
        <Role.select aria-label="Input method">
          <Role.optgroup label="Devices">
            <Role.option ref={setOption} value="keyboard">
              Keyboard
            </Role.option>
          </Role.optgroup>
        </Role.select>
      </Role.fieldset>
      <p>
        Native refs:{" "}
        <Role.output aria-label="Element refs">{elementRefs()}</Role.output>
      </p>
      <Role.kbd
        ref={setComposed}
        title="Control K"
        render={<As.span />}
        wrapInstance={[
          (props) => (
            <div role="group" aria-label="Shortcut">
              {props.children}
            </div>
          ),
        ]}
      >
        Ctrl K
      </Role.kbd>
      <p>
        Composed ref:{" "}
        <Role.output aria-label="Composed ref">{composedRef()}</Role.output>
      </p>
      <Role.button
        type="button"
        onClick={() => {
          setElementRefs(
            [keyboard(), separator(), time(), cell(), fieldset(), option()]
              .map((element) => element?.localName)
              .join(", "),
          );
          setComposedRef(composed()?.localName ?? "Missing ref");
        }}
      >
        Inspect elements
      </Role.button>
    </Role.article>
  );
}
