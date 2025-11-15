import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

export default function Thumbnail() {
  return (
    <div className="ak-dialog_idle max-w-100 static flex flex-col gap-4 items-start">
      <div className="text-lg font-medium">Framer Motion</div>
      <PlaceholderText>
        Your payment has been successfully processed. We have emailed your
        receipt.
      </PlaceholderText>
      <div className="ak-button-classic_idle">OK</div>
    </div>
  );
}
