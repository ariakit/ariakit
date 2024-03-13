import type { ReactNode } from "react";
import { TagContextProvider } from "./tag-context.js";
import { useTagStore } from "./tag-store.js";
import type { TagStoreProps } from "./tag-store.js";

/**
 * Provides a tag store to [Tag](https://ariakit.org/components/tag) components.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * <TagProvider>
 *   <TagList>
 *     <Tag>For You</Tag>
 *     <Tag>Following</Tag>
 *   </TagList>
 *   <TagPanel>For You</TagPanel>
 *   <TagPanel>Following</TagPanel>
 * </TagProvider>
 * ```
 */
export function TagProvider(props: TagProviderProps = {}) {
  const store = useTagStore(props);
  return (
    <TagContextProvider value={store}>{props.children}</TagContextProvider>
  );
}

export interface TagProviderProps extends TagStoreProps {
  children?: ReactNode;
}
