import {
  checkboxCard,
  checkboxCardCheck,
  checkboxCardContent,
  checkboxCardDescription,
  checkboxCardGrid,
  checkboxCardLabel,
} from "@ariakit/ui/styles/checkbox-card.ts";
import { CheckIcon } from "lucide-react";
import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

// Decorative card lookalikes: keep the resting card style but disable the
// interactive state variants so the thumbnail stays hover-inert, like the
// box-patterns fake buttons.
function fakeCard(props?: Parameters<typeof checkboxCard.jsx>[0]) {
  return checkboxCard.jsx({
    $hoverOffset: false,
    $focus: false,
    $active: false,
    ...props,
  });
}

const contentProps = checkboxCardContent.jsx({ $orientation: "horizontal" });

const descriptionClass = checkboxCardDescription.jsx({
  $truncate: false,
}).className;

export default function Thumbnail() {
  return (
    <div className="flex flex-col gap-4 scale-85">
      <div
        {...checkboxCardGrid.jsx({
          // Same track size as the legacy ak-checkbox-card-grid-min-w-60.
          $minItemSize: "calc(var(--spacing) * 60)",
        })}
      >
        <div {...fakeCard()}>
          <div {...checkboxCardCheck.jsx()}>
            <CheckIcon />
          </div>
          <div {...contentProps}>
            <div {...checkboxCardLabel.jsx()}>Technology</div>
            <PlaceholderText className={descriptionClass}>
              Painting and creativity.
            </PlaceholderText>
          </div>
        </div>
        <div {...fakeCard()}>
          {/* A real checked checkbox (visually hidden by the card cv) drives
              the same ui-checked-within channels as the live component. */}
          <input type="checkbox" defaultChecked tabIndex={-1} aria-hidden />
          <div {...checkboxCardCheck.jsx()}>
            <CheckIcon />
          </div>
          <div {...contentProps}>
            <div {...checkboxCardLabel.jsx()}>Engineering</div>
            <PlaceholderText className={descriptionClass}>
              Designing and solutions.
            </PlaceholderText>
          </div>
        </div>
        <div {...fakeCard()}>
          <div {...checkboxCardCheck.jsx()}>
            <CheckIcon />
          </div>
          <div {...contentProps}>
            <div {...checkboxCardLabel.jsx()}>History</div>
            <PlaceholderText className={descriptionClass}>
              Exploring past events.
            </PlaceholderText>
          </div>
        </div>
      </div>
    </div>
  );
}
