import { useCallback } from "react";
import { PlaygroundPreview } from "ariakit-playground/playground-preview";
import { usePlaygroundState } from "ariakit-playground/playground-state";
import { hasOwnProperty } from "ariakit-utils/misc";

// @ts-expect-error
export default function MarkdownPage(props) {
  const defaultValues =
    props.defaultValues[Object.keys(props.defaultValues)[0]!];

  const playground = usePlaygroundState({ defaultValues });

  const deps = props.deps[Object.keys(props.deps)[0]!];

  const getModule = useCallback(
    (path: string) => {
      if (hasOwnProperty(deps, path)) {
        return deps[path];
      }
      return null;
    },
    [deps]
  );

  return (
    <PlaygroundPreview
      state={playground}
      getModule={getModule}
      className="flex min-h-[300px] items-center justify-center"
    />
  );
}
