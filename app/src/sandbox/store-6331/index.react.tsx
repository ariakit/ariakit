import * as Ariakit from "@ariakit/react";
import type { Store } from "@ariakit/store";
import { createStore, init, sync } from "@ariakit/store";
import { useEffect, useState } from "react";

const MAX_IN_STOCK = 5;

interface QuantityState {
  quantity: number;
}

const cartStore = createStore<QuantityState>({ quantity: 0 });
const summaryStore = createStore<QuantityState>({ quantity: 0 });
const quantityStore = createStore<QuantityState>(
  { quantity: 0 },
  cartStore,
  summaryStore,
);

sync(cartStore, ["quantity"], (state) => {
  if (state.quantity <= MAX_IN_STOCK) return;
  cartStore.setState("quantity", MAX_IN_STOCK);
});

function useQuantity(store: Store<QuantityState>) {
  const [quantity, setQuantity] = useState(() => store.getState().quantity);
  useEffect(() => {
    return sync(store, ["quantity"], (state) => {
      setQuantity(state.quantity);
    });
  }, [store]);
  return quantity;
}

export default function Example() {
  useEffect(() => init(quantityStore), []);
  const quantity = useQuantity(quantityStore);
  const cartQuantity = useQuantity(cartStore);
  const summaryQuantity = useQuantity(summaryStore);

  return (
    <div className="flex flex-col items-start gap-3">
      <Ariakit.Button
        className="rounded bg-blue-600 px-3 py-1 text-white"
        onClick={() => {
          quantityStore.setState("quantity", (quantity) => quantity + 3);
        }}
      >
        Add 3
      </Ariakit.Button>
      <p>
        Selected: <output aria-label="Selected">{quantity}</output>
      </p>
      <p>
        Cart: <output aria-label="Cart">{cartQuantity}</output>
      </p>
      <p>
        Order summary:{" "}
        <output aria-label="Order summary">{summaryQuantity}</output>
      </p>
    </div>
  );
}
