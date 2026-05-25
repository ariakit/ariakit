"use client";

import { Role } from "@ariakit/react";
import { Button } from "@ariakit/react/button";
import type {
  TooltipAnchorProps,
  TooltipProps,
  TooltipProviderProps,
} from "@ariakit/react/tooltip";
import {
  Tooltip,
  TooltipAnchor,
  TooltipProvider,
} from "@ariakit/react/tooltip";
import { forwardRef, type ReactNode } from "react";
import { twJoin } from "tailwind-merge";

export interface TooltipButtonProps extends Omit<
  TooltipAnchorProps<"button">,
  "title"
> {
  title: ReactNode;
  placement?: TooltipProviderProps["placement"];
  timeout?: TooltipProviderProps["timeout"];
  showTimeout?: TooltipProviderProps["showTimeout"];
  hideTimeout?: TooltipProviderProps["hideTimeout"];
  popup?: TooltipProps["render"];
  gutter?: TooltipProps["gutter"];
  shift?: TooltipProps["shift"];
  fixed?: boolean;
}

export const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(
  function TooltipButton(
    {
      title,
      placement,
      timeout,
      showTimeout,
      hideTimeout,
      popup,
      gutter,
      shift,
      fixed,
      store,
      ...props
    },
    ref,
  ) {
    return (
      <TooltipProvider
        placement={placement}
        timeout={timeout}
        showTimeout={showTimeout}
        hideTimeout={hideTimeout}
        store={store}
      >
        <Role.button
          ref={ref}
          {...props}
          render={<TooltipAnchor render={<Button render={props.render} />} />}
        />
        <Tooltip
          fixed={fixed}
          gutter={gutter}
          shift={shift}
          unmountOnHide
          render={popup}
          className={twJoin(
            "z-50 cursor-default rounded-md px-2 py-1 text-sm",
            "drop-shadow-sm dark:drop-shadow-sm-dark",
            "bg-gray-150 dark:bg-gray-700",
            "text-black dark:text-white",
            "border border-gray-300 dark:border-gray-600",
          )}
        >
          {title}
        </Tooltip>
      </TooltipProvider>
    );
  },
);
