import { useCallback, useMemo } from "react";
import { useControlledState } from "ariakit-utils/hooks";
import { useStorePublisher } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";
import {
  CompositeState,
  CompositeStateProps,
  useCompositeState,
} from "../composite/composite-state";
import { CollectionTreeItem } from "./__utils";

function addToExpandedIds(
  prevExpandedIds: TreeState["expandedIds"],
  id?: string | null
) {
  if (!prevExpandedIds) return prevExpandedIds;
  if (id === null || id === undefined) return;
  if (prevExpandedIds.includes(id)) return prevExpandedIds;

  return [...prevExpandedIds, id];
}

function deleteFromExpandedIds(
  prevExpandedIds: TreeState["expandedIds"],
  id?: string | null
) {
  if (!prevExpandedIds) return prevExpandedIds;
  if (id === null || id === undefined) return;

  const indexToDelete = prevExpandedIds?.indexOf(id);
  if (indexToDelete > -1) {
    const newExpandedIds = [...prevExpandedIds];
    newExpandedIds.splice(indexToDelete, 1);
    return newExpandedIds;
  }

  return prevExpandedIds;
}

export function useTreeState({
  defaultExpandedIds = [],
  orientation = "vertical",
  ...props
}: TreeStateProps = {}): TreeState {
  const [expandedIds, setExpandedIds] = useControlledState(
    defaultExpandedIds,
    props.expandedIds,
    props.setExpandedIds
  );

  const composite = useCompositeState<CollectionTreeItem>({
    orientation,
    ...props,
  });

  const expand: TreeState["expand"] = useCallback((id) => {
    setExpandedIds((prevExpandedIds) => {
      return addToExpandedIds(prevExpandedIds, id) || prevExpandedIds;
    });
  }, []);

  const collapse: TreeState["collapse"] = useCallback((id) => {
    setExpandedIds((prevExpandedIds) => {
      return deleteFromExpandedIds(prevExpandedIds, id) || prevExpandedIds;
    });
  }, []);

  const toggleExpand: TreeState["toggleExpand"] = useCallback((id) => {
    if (id === null || id === undefined) return;
    setExpandedIds((prevExpandedIds) => {
      const indexToDelete = prevExpandedIds?.indexOf(id);
      if (indexToDelete > -1) {
        return deleteFromExpandedIds(prevExpandedIds, id) || prevExpandedIds;
      } else {
        return addToExpandedIds(prevExpandedIds, id) || prevExpandedIds;
      }
    });
  }, []);

  const state = useMemo(
    () => ({
      ...composite,
      expandedIds,
      setExpandedIds,
      expand,
      collapse,
      toggleExpand,
    }),
    [composite, expandedIds, setExpandedIds, expand, collapse, toggleExpand]
  );

  return useStorePublisher(state);
}

export type TreeState = CompositeState<CollectionTreeItem> & {
  expandedIds?: string[];
  setExpandedIds: SetState<TreeState["expandedIds"]>;
  expand: TreeState["move"];
  collapse: TreeState["move"];
  toggleExpand: TreeState["move"];
};

export type TreeStateProps = CompositeStateProps<CollectionTreeItem> &
  Partial<Pick<TreeState, "expandedIds">> & {
    defaultExpandedIds?: TreeState["expandedIds"];
    setExpandedIds?: (expandedIds: TreeState["expandedIds"]) => void;
  };
