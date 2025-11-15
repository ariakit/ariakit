import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

export default function Thumbnail() {
  return (
    <div className="flex flex-col gap-4 scale-85">
      <div className="ak-checkbox-card-grid ak-checkbox-card-grid-min-w-60">
        <div className="ak-checkbox-card">
          <div className="ak-checkbox-card-check"></div>
          <div className="ak-checkbox-card-content">
            <div className="ak-checkbox-card-label">Technology</div>
            <PlaceholderText className="ak-checkbox-card-description">
              Painting and creativity.
            </PlaceholderText>
          </div>
        </div>
        <div className="ak-checkbox-card ak-checkbox-card_checked">
          <div className="ak-checkbox-card-check">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="size-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
          <div className="ak-checkbox-card-content">
            <div className="ak-checkbox-card-label">Engineering</div>
            <PlaceholderText className="ak-checkbox-card-description">
              Designing and solutions.
            </PlaceholderText>
          </div>
        </div>
        <div className="ak-checkbox-card">
          <div className="ak-checkbox-card-check"></div>
          <div className="ak-checkbox-card-content">
            <div className="ak-checkbox-card-label">History</div>
            <PlaceholderText className="ak-checkbox-card-description">
              Exploring past events.
            </PlaceholderText>
          </div>
        </div>
      </div>
    </div>
  );
}
