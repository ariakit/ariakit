import * as React from "react";

interface DescriptionContextValue {
  descriptionId?: string;
  defaultDescriptionId: string;
  registerDescription: (id: string) => () => void;
}

/**
 * Lets an element describe itself by a description nested in its content, which
 * then leaves the element's name.
 */
export const DescriptionContext =
  React.createContext<DescriptionContextValue | null>(null);

/**
 * Tracks the description that registers through a `DescriptionContext` provider
 * with the returned `context`. Returns the id that the described element should
 * reference in `aria-describedby`.
 */
export function useDescriptionRegistry() {
  const defaultDescriptionId = React.useId();
  // Server markup can't know whether a description follows, so the element
  // first expects one with the default id. That keeps the description out of
  // the name before hydration.
  const [descriptionId, setDescriptionId] = React.useState<string | undefined>(
    defaultDescriptionId,
  );
  const hasDescriptionRef = React.useRef(false);

  const registerDescription = React.useCallback((id: string) => {
    hasDescriptionRef.current = true;
    setDescriptionId(id);
    return () => {
      setDescriptionId((current) => (current === id ? undefined : current));
    };
  }, []);

  const context = React.useMemo(
    () => ({ descriptionId, defaultDescriptionId, registerDescription }),
    [descriptionId, defaultDescriptionId, registerDescription],
  );

  // Child effects run first, so descriptions have registered by now. Drop the
  // reference to a description that the element doesn't have.
  React.useEffect(() => {
    if (hasDescriptionRef.current) return;
    setDescriptionId(undefined);
  }, []);

  return { descriptionId, context };
}

/**
 * Registers a description with the nearest `DescriptionContext`. Returns its id
 * and whether the described element references it. A hidden element still
 * describes the element that references it, so hiding it while it describes
 * keeps the text out of the name, which comes from the content.
 */
export function useDescription(id?: string) {
  const context = React.useContext(DescriptionContext);
  const defaultId = React.useId();
  const descriptionId = id ?? context?.defaultDescriptionId ?? defaultId;
  const registerDescription = context?.registerDescription;

  React.useEffect(() => {
    if (!registerDescription) return;
    return registerDescription(descriptionId);
  }, [registerDescription, descriptionId]);

  return {
    id: descriptionId,
    describes: context?.descriptionId === descriptionId,
  };
}

export interface UseLabelDescriptionProps {
  id?: string;
  "aria-describedby"?: string;
}

/**
 * Connects an input to the label that wraps it and to a description inside that
 * label. Give `id` to the label's `htmlFor` and to the input, give
 * `describedBy` to the input's `aria-describedby`, and give `context` to a
 * `DescriptionContext` provider around the label.
 */
export function useLabelDescription(props: UseLabelDescriptionProps) {
  const defaultId = React.useId();
  const { descriptionId, context } = useDescriptionRegistry();
  // Assistive technologies such as Dragon and Voice Control don't recognize a
  // label that only wraps its input, so the label also points at the input.
  const id = props.id ?? defaultId;
  // Keep the caller's descriptions after the label's own.
  const describedBy =
    [descriptionId, props["aria-describedby"]].filter(Boolean).join(" ") ||
    undefined;
  return { id, describedBy, context };
}
