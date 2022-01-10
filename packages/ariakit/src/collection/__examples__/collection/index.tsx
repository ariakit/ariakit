import {
  Collection,
  CollectionItem,
  useCollectionState,
} from "ariakit/collection";
import "./style.css";

export default function Example() {
  const collection = useCollectionState();

  return (
    <Collection state={collection} className="collection">
      <CollectionItem className="collection-item">🍎 Apple</CollectionItem>
      <CollectionItem className="collection-item">🍇 Grape</CollectionItem>
      <CollectionItem className="collection-item">🍊 Orange</CollectionItem>
      <CollectionItem className="collection-item">🍓 Strawberry</CollectionItem>
      <CollectionItem className="collection-item">🍉 Watermelon</CollectionItem>
    </Collection>
  );
}
