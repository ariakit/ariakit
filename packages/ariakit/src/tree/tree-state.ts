import { useCallback, useMemo } from "react";
import { useControlledState } from "ariakit-utils/hooks";
import { useStorePublisher } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";
import {
  CollectionState,
  useCollectionState,
} from "../collection/collection-state";
import {
  CompositeState,
  CompositeStateProps,
  useCompositeState,
} from "../composite/composite-state";

type Item = CompositeState["items"][number] & {
  value?: string;
};

type TreeItem = CollectionState["items"][number] & {
  id: string;
  groupId?: string | null;
};

type TreeGroupItem = CollectionState["items"][number] & {
  id: string;
  groupId?: string | null;
  treeItemId?: string | null;
  visible?: boolean;
  level?: number | null;
};

type TreeGroupLabelItem = CollectionState["items"][number] & {
  id: string;
  treeItemId?: string | null;
};

function addToExpandedIds(
  prevExpandedIds: TreeState["expandedIds"],
  id?: string
) {
  if (!prevExpandedIds) return prevExpandedIds;
  if (!id) return prevExpandedIds;

  return [...prevExpandedIds, id];
}

function deleteFromExpandedIds(
  prevExpandedIds: TreeState["expandedIds"],
  id?: string
) {
  if (!prevExpandedIds) return prevExpandedIds;
  if (!id) return prevExpandedIds;

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

  const composite = useCompositeState<Item>({ orientation, ...props });
  const treeItems = useCollectionState<TreeItem>();
  const treeGroups = useCollectionState<TreeGroupItem>();
  const treeGroupLabels = useCollectionState<TreeGroupLabelItem>();

  const expand = useCallback((id) => {
    setExpandedIds((prevExpandedIds) => {
      return addToExpandedIds(prevExpandedIds, id) || prevExpandedIds;
    });
  }, []);

  const collapse = useCallback((id) => {
    setExpandedIds((prevExpandedIds) => {
      return deleteFromExpandedIds(prevExpandedIds, id) || prevExpandedIds;
    });
  }, []);

  const toggleExpand = useCallback((id) => {
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
      treeItems,
      treeGroups,
      treeGroupLabels,
      expand,
      collapse,
      toggleExpand,
    }),
    [
      composite,
      expandedIds,
      setExpandedIds,
      treeItems,
      treeGroups,
      treeGroupLabels,
      expand,
      collapse,
      toggleExpand,
    ]
  );

  return useStorePublisher(state);
}

export type TreeState = CompositeState<Item> & {
  expandedIds?: string[];
  setExpandedIds: SetState<TreeState["expandedIds"]>;
  treeItems: CollectionState<TreeItem>;
  treeGroups: CollectionState<TreeGroupItem>;
  treeGroupLabels: CollectionState<TreeGroupLabelItem>;
  expand: TreeState["move"];
  collapse: TreeState["move"];
  toggleExpand: TreeState["move"];
};

export type TreeStateProps = CompositeStateProps<Item> &
  Partial<Pick<TreeState, "expandedIds">> & {
    defaultExpandedIds?: TreeState["expandedIds"];
    setExpandedIds?: (expandedIds: TreeState["expandedIds"]) => void;
  };
