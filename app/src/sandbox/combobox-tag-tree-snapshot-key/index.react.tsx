import { useState } from "react";
import * as Ariakit from "./ariakit-experimental.react.ts";

const people = [
  "Ada Lovelace",
  "Alan Turing",
  "Grace Hopper",
  "Linus Torvalds",
];

export default function Example() {
  const [values, setValues] = useState<string[]>([]);
  const [inviteLinkVisible, setInviteLinkVisible] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [treeSnapshotKey, setTreeSnapshotKey] = useState(0);

  const showInviteLink = () => {
    setInviteLinkVisible(true);
    setTreeSnapshotKey((key) => key + 1);
  };

  return (
    <div className="wrapper">
      {/* Rendered above the field, where the open popup cannot cover it. The
          `flip={false}` prop below keeps the popup growing downwards from the
          input, so this stays true on a short viewport. */}
      {inviteLinkVisible && (
        <div>
          <button type="button" onClick={() => setLinkCopied(true)}>
            Copy invite link
          </button>
          {/* The live region mounts with the panel rather than with the
              message, so assistive technology announces the message. */}
          <span role="status">{linkCopied && "Link copied"}</span>
        </div>
      )}
      <Ariakit.TagProvider values={values} setValues={setValues}>
        <Ariakit.TagLabel className="ak-tag-list-label">
          Invitees
        </Ariakit.TagLabel>
        <Ariakit.TagControl className="ak-tag-list ak-input ak-focusable">
          {/* The list has to mount while the popup is already open. A list that
              was in the element tree the popup captured passes its outside mark
              down to every tag added later, so only render it once the field
              holds a tag, the way a field that hides an empty list would. */}
          {values.length > 0 && (
            <Ariakit.TagList style={{ display: "contents" }}>
              {values.map((value) => (
                <Ariakit.Tag key={value} value={value} className="ak-tag">
                  {value}
                  <Ariakit.TagRemove className="ak-tag-remove" />
                </Ariakit.Tag>
              ))}
            </Ariakit.TagList>
          )}
          <Ariakit.ComboboxProvider>
            <Ariakit.Combobox
              render={<Ariakit.TagInput className="ak-tag-input" />}
            />
            <Ariakit.ComboboxPopover
              aria-label="Suggestions"
              className="ak-popover ak-popup ak-elevation-1"
              flip={false}
              gutter={8}
              unmountOnHide
              // An application that renders its own content outside the popup
              // while the popup stays open has to tell it to read the element
              // tree again. The popup contributes its own key for newly
              // rendered tags, so this one has to travel alongside it.
              // https://github.com/ariakit/ariakit/issues/7330
              unstable_treeSnapshotKey={treeSnapshotKey}
            >
              {people.map((person) => (
                <Ariakit.ComboboxItem
                  key={person}
                  value={person}
                  className="ak-combobox-item"
                />
              ))}
              {/* Reveals the invite link above the field without closing the
                  popup, so the key above is the only thing that can bring that
                  content into the element tree the popup captured. An item
                  without a value neither selects nor hides on click. */}
              <Ariakit.ComboboxItem
                className="ak-combobox-item"
                onClick={showInviteLink}
              >
                Invite by link
              </Ariakit.ComboboxItem>
            </Ariakit.ComboboxPopover>
          </Ariakit.ComboboxProvider>
        </Ariakit.TagControl>
      </Ariakit.TagProvider>
    </div>
  );
}
