import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import { button, buttonSlot } from "@ariakit/ui/styles/button";
import {
  input,
  inputDescription,
  inputError,
  inputErrorIcon,
  inputErrorText,
  inputField,
  inputLabel,
  inputSlot,
} from "@ariakit/ui/styles/input";
import { CircleAlert, Eye, Globe } from "lucide-react";

export default function Cover() {
  return (
    // The fields stack when the card is too narrow for two columns.
    <div className="@container/fields w-[40em] max-w-full">
      <div className="grid items-start gap-6 @[30em]/fields:grid-cols-2">
        <div {...inputField.jsx()}>
          <span {...inputLabel.jsx()}>Email</span>
          <span {...input.jsx()} aria-invalid="true">
            maya@acme
          </span>
          <span {...inputError.jsx()}>
            <span {...inputErrorIcon.jsx()}>
              <CircleAlert />
            </span>
            <span {...inputErrorText.jsx()}>
              Enter a complete email address.
            </span>
          </span>
        </div>
        <div {...inputField.jsx()}>
          <span {...inputLabel.jsx()}>Website</span>
          <span {...input.jsx()}>
            <span {...inputSlot.jsx({ $ink: 60 })}>
              <Globe />
            </span>
            acme.dev
          </span>
          <SkeletonLine $weight="light" className="w-1/2" />
        </div>
        <div {...inputField.jsx()}>
          <span {...inputLabel.jsx()}>Password</span>
          <span {...input.jsx()}>
            <span className="flex-1">••••••••••••</span>
            <span {...inputSlot.jsx({ $size: "2xl" })}>
              <span {...button.jsx({ $size: "sm" })}>
                <span {...buttonSlot.jsx()}>
                  <Eye />
                </span>
              </span>
            </span>
          </span>
          <span {...inputDescription.jsx()}>Use at least 12 characters.</span>
        </div>
        <div {...inputField.jsx()}>
          <SkeletonLine $weight="medium" className="w-1/4" />
          <span {...input.jsx()}>
            <SkeletonLine $weight="light" className="w-2/5" />
          </span>
        </div>
      </div>
    </div>
  );
}
