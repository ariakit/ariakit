import * as React from "react";
import * as PropTypes from "prop-types";
import { ComposableContainer } from "constate";
import StepContainer, {
  StepContainerSelectors,
  StepContainerActions,
  StepContainerState
} from "../Step/StepContainer";

export const initialState: Partial<StepContainerState> = {
  loop: true,
  current: 0
};

// istanbul ignore next
const TabsContainer: ComposableContainer<
  StepContainerState,
  StepContainerActions,
  StepContainerSelectors
> = props => (
  <StepContainer
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
  />
);

// @ts-ignore
TabsContainer.propTypes = {
  initialState: PropTypes.object
};

export default TabsContainer;
