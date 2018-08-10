import React from "react";
import { Step } from "reakit";

const Component = () => (
  <Step.Container>
    {step => (
      <div>
        <Step.Previous {...step}>Previous</Step.Previous>
        <Step.Next {...step}>Next</Step.Next>
        <Step step="step1" {...step}>
          Step1
        </Step>
        <Step step="step2" {...step}>
          Step2
        </Step>
        <Step step="step3" {...step}>
          Step3
        </Step>
      </div>
    )}
  </Step.Container>
);

export default () => <Component />;
