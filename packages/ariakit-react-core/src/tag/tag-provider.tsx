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
 *   <TagListLabel>Invitees</TagListLabel>
 *   <TagList>
 *     <TagValues>
 *       {(values) =>
 *         values.map((value) => (
 *           <Tag key={value} value={value}>
 *             {value}
 *             <TagRemove />
 *           </Tag>
 *         ))
 *       }
 *     </TagValues>
 *     <TagInput />
 *   </TagList>
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
