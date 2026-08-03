import { Tag } from "@ariakit/react-components/tag/tag";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagListLabel } from "@ariakit/react-components/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { useEffect, useState } from "react";

const inheritedProperties = [
  ["aria-hidden", "true"],
  ["aria-label", "Inherited label"],
  ["role", "presentation"],
] as const;

export default function Example() {
  const [ready, setReady] = useState(false);
  const [ariaHidden, setAriaHidden] = useState("not inspected");
  const [role, setRole] = useState("not inspected");

  useEffect(() => {
    const descriptors = inheritedProperties.map(
      ([key]) =>
        [key, Object.getOwnPropertyDescriptor(Object.prototype, key)] as const,
    );

    for (const [key, value] of inheritedProperties) {
      // oxlint-disable-next-line no-extend-native
      Object.defineProperty(Object.prototype, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      });
    }

    setReady(true);

    return () => {
      for (const [key, descriptor] of descriptors) {
        if (descriptor) {
          // oxlint-disable-next-line no-extend-native
          Object.defineProperty(Object.prototype, key, descriptor);
        } else {
          Reflect.deleteProperty(Object.prototype, key);
        }
      }
    };
  }, []);

  const inspectListbox = () => {
    const listbox = document.querySelector('[aria-live="polite"]');
    setAriaHidden(listbox?.getAttribute("aria-hidden") ?? "not set");
    setRole(listbox?.getAttribute("role") ?? "not set");
  };

  if (!ready) return <p>Preparing tag list</p>;

  return (
    <TagProvider defaultValues={["React"]}>
      <TagListLabel>Tags</TagListLabel>
      <TagList>
        <Tag value="React">React</Tag>
      </TagList>
      <button type="button" onClick={inspectListbox}>
        Inspect listbox
      </button>
      <p>
        Listbox aria-hidden:{" "}
        <output aria-label="Listbox aria-hidden">{ariaHidden}</output>
      </p>
      <p>
        Listbox role: <output aria-label="Listbox role">{role}</output>
      </p>
    </TagProvider>
  );
}
