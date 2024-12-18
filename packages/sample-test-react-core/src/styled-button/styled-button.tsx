import { twMerge } from "tailwind-merge";
import { Button } from "../button/button.tsx";

export interface StyledButtonInterface {
  className?: string;
  children: string;
}

export const StyledButton: React.FC<StyledButtonInterface> = ({
  className = "",
  children,
}) => {
  return (
    <Button
      className={twMerge(
        "bg-primary hover:bg-primary/95 px-md py-lg text-textPrimary font-bold",
        className,
      )}
    >
      {children}
    </Button>
  );
};
