import Step from "./Step";
import StepContainer from "./StepContainer";
import StepToggle from "./StepToggle";
import StepShow from "./StepShow";
import StepHide from "./StepHide";
import StepNext from "./StepNext";
import StepPrevious from "./StepPrevious";

export * from "./Step";
export * from "./StepContainer";
export * from "./StepToggle";
export * from "./StepShow";
export * from "./StepHide";
export * from "./StepNext";
export * from "./StepPrevious";

export default Object.assign(Step, {
  Container: StepContainer,
  Toggle: StepToggle,
  Show: StepShow,
  Hide: StepHide,
  Next: StepNext,
  Previous: StepPrevious
});
