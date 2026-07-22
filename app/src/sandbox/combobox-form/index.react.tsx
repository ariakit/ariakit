import * as Ariakit from "@ariakit/react";
import { useTagContext } from "@ariakit/react-components/tag/tag-context";
import { TagInput } from "@ariakit/react-components/tag/tag-input";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagListLabel } from "@ariakit/react-components/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { useTagStore } from "@ariakit/react-components/tag/tag-store";
import { sync } from "@ariakit/store";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const fruits = [
  ["apple", "Apple"],
  ["banana", "Banana"],
  ["orange", "Orange"],
  ["grape", "Grape"],
] as const;

function ResetAndReplaceAddress() {
  const store = Ariakit.useComboboxContext();
  return (
    <button
      type="button"
      onClick={(event) => {
        event.currentTarget.form?.reset();
        store?.setValue("Paris");
      }}
    >
      Reset and replace address
    </button>
  );
}

function TrackTagValueChanges({
  setChanges,
}: {
  setChanges: Dispatch<SetStateAction<string[]>>;
}) {
  const store = useTagContext();
  useEffect(() => {
    if (!store) return;
    return sync(store, ["value"], (state) => {
      setChanges((changes) => [...changes, state.value]);
    });
  }, [store, setChanges]);
  return null;
}

function ShadowAddress() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    setRoot(host.shadowRoot ?? host.attachShadow({ mode: "open" }));
  }, []);

  return (
    <>
      <div ref={hostRef} />
      {root &&
        createPortal(
          <form aria-label="Shadow address">
            <Ariakit.ComboboxProvider>
              <Ariakit.ComboboxLabel>Shadow home town</Ariakit.ComboboxLabel>
              <Ariakit.Combobox name="shadowHomeTown" />
            </Ariakit.ComboboxProvider>
          </form>,
          root,
        )}
    </>
  );
}

export default function Example() {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [submittedValues, setSubmittedValues] = useState<string[] | null>(null);
  const [controlledHomeTown, setControlledHomeTown] = useState("");
  const [controlledElementHomeTown, setControlledElementHomeTown] =
    useState("");
  const [controlledStoreHomeTown, setControlledStoreHomeTown] = useState("");
  const [controlledSiblingHomeTown, setControlledSiblingHomeTown] =
    useState("");
  const [partiallySharedHomeTown, setPartiallySharedHomeTown] = useState("");
  const [controlledTagHomeTown, setControlledTagHomeTown] = useState("");
  const [controlledTagChanges, setControlledTagChanges] = useState<string[]>(
    [],
  );
  const controlledStore = Ariakit.useComboboxStore({
    value: controlledStoreHomeTown,
    setValue: setControlledStoreHomeTown,
  });
  const controlledElementStore = Ariakit.useComboboxStore();
  const siblingSourceStore = Ariakit.useComboboxStore();
  Ariakit.useComboboxStore({
    store: siblingSourceStore,
    value: controlledSiblingHomeTown,
    setValue: setControlledSiblingHomeTown,
  });
  const partialSourceStore = Ariakit.useCompositeStore();
  Ariakit.useComboboxStore({
    store: partialSourceStore,
    value: partiallySharedHomeTown,
    setValue: setPartiallySharedHomeTown,
  });
  const partiallySharedStore = Ariakit.useComboboxStore({
    store: partialSourceStore,
  });
  const controlledTagStore = useTagStore({
    value: controlledTagHomeTown,
    setValue: setControlledTagHomeTown,
  });

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setSubmittedValues(formData.getAll("fruits").map(String));
        }}
      >
        <Ariakit.ComboboxProvider
          selectedValue={selectedValues}
          setSelectedValue={setSelectedValues}
          resetValueOnHide={false}
        >
          <Ariakit.ComboboxLabel>Favorite fruits</Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="fruits" />
          <Ariakit.ComboboxPopover>
            {fruits.map(([value, label]) => (
              <Ariakit.ComboboxItem key={value} value={value}>
                {label}
              </Ariakit.ComboboxItem>
            ))}
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
        <output>
          {submittedValues ? JSON.stringify(submittedValues) : null}
        </output>
      </form>

      <form id="address" aria-label="Address">
        <label>
          Name
          <input name="name" />
        </label>
        <Ariakit.ComboboxProvider>
          <Ariakit.ComboboxLabel>Home town</Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="homeTown" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
          <ResetAndReplaceAddress />
        </Ariakit.ComboboxProvider>
        <Ariakit.ComboboxProvider defaultValue="Boston">
          <Ariakit.ComboboxLabel>Birth place</Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="birthPlace" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <button
          type="button"
          onClick={(event) => event.currentTarget.form?.reset()}
        >
          Reset address
        </button>
      </form>

      <Ariakit.ComboboxProvider>
        <Ariakit.ComboboxLabel>Former home town</Ariakit.ComboboxLabel>
        <Ariakit.Combobox name="formerHomeTown" form="address" />
        <Ariakit.ComboboxPopover>
          <Ariakit.ComboboxItem value="Boston" />
          <Ariakit.ComboboxItem value="San Diego" />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>

      <ShadowAddress />

      <form
        aria-label="Canceled address"
        onReset={(event) => event.preventDefault()}
      >
        <label>
          Canceled name
          <input name="canceledName" />
        </label>
        <Ariakit.ComboboxProvider>
          <Ariakit.ComboboxLabel>Canceled home town</Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="canceledHomeTown" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <button type="reset">Cancel address reset</button>
      </form>

      <form aria-label="Controlled address">
        <Ariakit.ComboboxProvider
          value={controlledHomeTown}
          setValue={setControlledHomeTown}
        >
          <Ariakit.ComboboxLabel>Controlled home town</Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="controlledHomeTown" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <button type="reset">Reset controlled address</button>
      </form>

      <form aria-label="Controlled element address">
        <Ariakit.ComboboxProvider store={controlledElementStore}>
          <Ariakit.ComboboxLabel>
            Controlled element home town
          </Ariakit.ComboboxLabel>
          <Ariakit.Combobox
            name="controlledElementHomeTown"
            setValueOnChange={false}
            render={
              <textarea
                value={controlledElementHomeTown}
                onChange={(event) =>
                  setControlledElementHomeTown(event.target.value)
                }
              />
            }
          />
        </Ariakit.ComboboxProvider>
        <button type="reset">Reset controlled element address</button>
        <button
          type="button"
          onClick={(event) => {
            event.currentTarget.form?.reset();
            controlledElementStore.setValue("Paris");
          }}
        >
          Reset and replace controlled element address
        </button>
      </form>

      <form aria-label="Controlled store address">
        <Ariakit.ComboboxProvider store={controlledStore}>
          <Ariakit.ComboboxLabel>
            Controlled store home town
          </Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="controlledStoreHomeTown" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <button type="reset">Reset controlled store address</button>
      </form>

      <form aria-label="Sibling controlled store address">
        <Ariakit.ComboboxProvider store={siblingSourceStore}>
          <Ariakit.ComboboxLabel>
            Sibling controlled store home town
          </Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="siblingControlledStoreHomeTown" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <button type="reset">Reset sibling controlled store address</button>
      </form>

      <form aria-label="Partially shared address">
        <Ariakit.ComboboxProvider store={partiallySharedStore}>
          <Ariakit.ComboboxLabel>
            Partially shared home town
          </Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="partiallySharedHomeTown" />
        </Ariakit.ComboboxProvider>
        <button type="reset">Reset partially shared address</button>
      </form>

      <TagProvider store={controlledTagStore}>
        <TrackTagValueChanges setChanges={setControlledTagChanges} />
        <form
          aria-label="Controlled tag address"
          data-value-changes={JSON.stringify(controlledTagChanges)}
        >
          <TagListLabel>Controlled tag home town</TagListLabel>
          <TagList>
            <Ariakit.ComboboxProvider>
              <Ariakit.Combobox
                aria-label="Controlled tag home town"
                name="controlledTagHomeTown"
                render={<TagInput />}
              />
              <Ariakit.ComboboxPopover>
                <Ariakit.ComboboxItem value="Boston" />
                <Ariakit.ComboboxItem value="San Diego" />
              </Ariakit.ComboboxPopover>
            </Ariakit.ComboboxProvider>
          </TagList>
          <button type="reset" onClick={() => setControlledTagChanges([])}>
            Reset controlled tag address
          </button>
        </form>
      </TagProvider>

      <form aria-label="Inline address">
        <Ariakit.ComboboxProvider>
          <Ariakit.ComboboxLabel>Inline home town</Ariakit.ComboboxLabel>
          <Ariakit.Combobox autoComplete="inline" autoSelect />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <Ariakit.ComboboxProvider>
          <Ariakit.ComboboxLabel>
            Inline auto select home town
          </Ariakit.ComboboxLabel>
          <Ariakit.Combobox autoComplete="inline" autoSelect="always" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => event.currentTarget.form?.reset()}
        >
          Reset inline address
        </button>
      </form>

      <Ariakit.ComboboxProvider defaultSelectedValue={["apple"]}>
        <Ariakit.Combobox
          aria-label="Non-composite fruits"
          composite={false}
          form="non-composite-form"
          name="non-composite-fruits"
        />
      </Ariakit.ComboboxProvider>

      <form
        id="non-composite-form"
        aria-label="Non-composite fruits"
        data-composite-false
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <button type="submit">Submit non-composite fruits</button>
      </form>

      <form aria-label="Disabled fruits">
        <Ariakit.ComboboxProvider defaultSelectedValue={["apple"]}>
          <Ariakit.Combobox
            aria-disabled
            aria-label="Disabled fruits"
            composite={false}
            name="disabled-fruits"
          />
        </Ariakit.ComboboxProvider>
      </form>

      <Ariakit.ComboboxProvider defaultSelectedValue="apple">
        <Ariakit.Combobox aria-label="Single fruit" name="single-fruit" />
      </Ariakit.ComboboxProvider>
    </>
  );
}
