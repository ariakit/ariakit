import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

export default function Thumbnail() {
  return (
    <div className="h-full grid place-items-center-safe">
      <div className="ak-disclosure ak-disclosure_open ak-frame-card ak-layer ak-bordering">
        <div className="ak-disclosure-button before:ak-disclosure-chevron-right">
          React Aria
        </div>
        <div className="ak-disclosure-content transition-none">
          <div>
            <PlaceholderText>
              Create an account, verify your email, and follow the setup wizard
              to create your first workspace.
            </PlaceholderText>
          </div>
        </div>
      </div>
    </div>
  );
}
