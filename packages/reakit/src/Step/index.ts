import Step from "./Step";
import StepContainer from "./StepContainer";
import StepToggle from "./StepToggle";
import StepShow from "./StepShow";
import StepHide from "./StepHide";
import StepNext from "./StepNext";
import StepPrevious from "./StepPrevious";

interface StepComponents {
  Container: typeof StepContainer;
  Toggle: typeof StepToggle;
  Show: typeof StepShow;
  Hide: typeof StepHide;
  Next: typeof StepNext;
  Previous: typeof StepPrevious;
}

const TypedStep = Step as typeof Step & StepComponents;

TypedStep.Container = StepContainer;
TypedStep.Toggle = StepToggle;
TypedStep.Show = StepShow;
TypedStep.Hide = StepHide;
TypedStep.Next = StepNext;
TypedStep.Previous = StepPrevious;

export * from "./Step";
export * from "./StepContainer";
export * from "./StepToggle";
export * from "./StepShow";
export * from "./StepHide";
export * from "./StepNext";
export * from "./StepPrevious";

export default TypedStep;
