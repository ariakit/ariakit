import { PlaceholderText } from "../../components/placeholder-text.react.tsx";

export default function Thumbnail() {
  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="ak-input w-64 flex">
        <PlaceholderText>e.g., Apple</PlaceholderText>
      </div>
      <div className="ak-popover_idle ak-frame-force-container w-66 max-w-full">
        <div className="ak-frame-container/2 text-sm ak-text/60 font-medium">
          Fruits
        </div>
        <div className="ak-frame-container/2">
          <PlaceholderText layer="ak-layer-primary">
            Primary option
          </PlaceholderText>
        </div>
        <div className="ak-frame-container/2">
          <PlaceholderText>Avocado</PlaceholderText>
        </div>
        <div className="ak-frame-container/2">
          <PlaceholderText>Banana</PlaceholderText>
        </div>
        <div className="ak-frame-container/2 text-sm ak-text/60 font-medium">
          Vegetables
        </div>
        <div className="ak-frame-container/2">
          <PlaceholderText>Pineapple</PlaceholderText>
        </div>
        <div className="ak-frame-container/2">
          <PlaceholderText>Potato</PlaceholderText>
        </div>
      </div>
    </div>
  );
}
