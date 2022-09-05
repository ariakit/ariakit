import { useCallback, useMemo } from "react";
import { useControlledState } from "ariakit-react-utils/hooks";
import { useStorePublisher } from "ariakit-react-utils/store";
import { SetState } from "ariakit-utils/types";

export function usePlaygroundState(
  props: PlaygroundStateProps = {}
): PlaygroundState {
  const [values, setValues] = useControlledState(
    props.defaultValues || {},
    props.values,
    props.setValues
  );

  const setValue: PlaygroundState["setValue"] = useCallback(
    (file, value) => {
      setValues((prevValues) => ({ ...prevValues, [file]: value }));
    },
    [setValues]
  );

  const state = useMemo(
    () => ({
      values,
      setValues,
      setValue,
    }),
    [values, setValues, setValue]
  );

  return useStorePublisher(state);
}

export type PlaygroundState = {
  values: Record<string, string>;
  setValues: SetState<PlaygroundState["values"]>;
  setValue: (file: string, value: string) => void;
};

export type PlaygroundStateProps = Partial<
  Pick<PlaygroundState, "values" | "setValues">
> & {
  defaultValues?: PlaygroundState["values"];
  setValues?: (values: PlaygroundState["values"]) => void;
};
