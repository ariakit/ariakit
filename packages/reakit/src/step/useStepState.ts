import * as React from "react";

export type StepState<Ids extends any[]> = {
  /**
   * List of ids
   */
  ids: Ids;
  /**
   * Active step index
   */
  // TODO: Use range when it's available
  // https://github.com/Microsoft/TypeScript/issues/15480
  activeIndex: number;
  /**
   * Map between ids and orders
   */
  ordered: {
    [key: string]: number;
  };
  getActiveId: () => Ids[number];
  hasPrevious: () => boolean;
  hasNext: () => boolean;
  indexOf: (idOrIndex: Ids[number] | number) => number;
  isActive: (idOrIndex: Ids[number] | number) => boolean;
  show: (idOrIndex: Ids[number] | number) => void;
  hide: () => void;
  toggle: (idOrIndex: Ids[number] | number) => void;
  previous: () => void;
  next: () => void;
  reorder: (id: Ids[number], order?: number) => void;
  register: (id: Ids[number], order?: number) => void;
  unregister: (id: Ids[number]) => void;
  update: (id: Ids[number], nextId: string, nextOrder?: number) => void;
};

export type UseStepStateOptions<Ids extends any[]> = {
  /**
   * The first index becomes the next one when the last one is active.
   * The last index becomes the previous one when the first one is active.
   * @default false
   */
  loop?: boolean;
  ids?: StepState<Ids>["ids"];
  activeIndex?: StepState<Ids>["activeIndex"];
  ordered?: StepState<Ids>["ordered"];
};

export function useStepState<Ids extends any[] = string[]>({
  loop = false,
  ids: initialIds = ([] as unknown) as Ids,
  activeIndex: initialActiveIndex = -1,
  ordered: initialOrdered = {}
}: UseStepStateOptions<Ids> = {}): StepState<Ids> {
  type State = StepState<Ids>;

  const [ids, setIds] = React.useState(initialIds);
  const [activeIndex, setActiveIndex] = React.useState(initialActiveIndex);
  const [ordered, setOrdered] = React.useState(initialOrdered);

  const getActiveId: State["getActiveId"] = () => ids[activeIndex];

  const hasPrevious: State["hasPrevious"] = () =>
    ids.length > 1 && Boolean(ids[activeIndex - 1]);

  const hasNext: State["hasNext"] = () =>
    ids.length > 1 && Boolean(ids[activeIndex + 1]);

  const indexOf: State["indexOf"] = idOrIndex =>
    typeof idOrIndex === "number" ? idOrIndex : ids.indexOf(idOrIndex);

  const isActive: State["isActive"] = idOrIndex =>
    activeIndex >= 0 && activeIndex === indexOf(idOrIndex);

  const show: State["show"] = idOrIndex => setActiveIndex(indexOf(idOrIndex));

  const hide: State["hide"] = () => setActiveIndex(-1);

  const toggle: State["toggle"] = idOrIndex =>
    isActive(idOrIndex) ? hide() : show(idOrIndex);

  const previous: State["previous"] = () => {
    if (hasPrevious()) {
      setActiveIndex(activeIndex - 1);
    } else if (loop && ids.length > 1) {
      setActiveIndex(ids.length - 1);
    }
  };

  const next: State["next"] = () => {
    if (hasNext()) {
      setActiveIndex(activeIndex + 1);
    } else if (loop && ids.length > 1) {
      setActiveIndex(0);
    }
  };

  const reorder: State["reorder"] = (id, order = 0) => {
    const nextOrdered: typeof ordered = { ...ordered, [id]: order };
    const nextIds = ([...ids] as Ids).sort(
      (a, b) => (nextOrdered[a] || 0) - (nextOrdered[b] || 0)
    );
    setOrdered(nextOrdered);
    setIds(nextIds);

    if (isActive(id)) {
      setActiveIndex(nextIds.indexOf(id));
    }
  };

  return {
    ids,
    activeIndex,
    ordered,
    getActiveId,
    hasPrevious,
    hasNext,
    indexOf,
    isActive,
    show,
    hide,
    toggle,
    previous,
    next,
    reorder,
    register: () => {},
    unregister: () => {},
    update: () => {}
  };
}

export default useStepState;
