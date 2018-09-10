import Card from "./Card";
import CardFit from "./CardFit";

interface CardComponents {
  Fit: typeof CardFit;
}

const C = Card as typeof Card & CardComponents;

C.Fit = CardFit;

export * from "./Card";

export default C;
