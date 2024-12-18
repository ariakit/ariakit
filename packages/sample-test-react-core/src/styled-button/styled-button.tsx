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
        // "bg-primary hover:bg-primary/95 px-md py-lg text-textPrimary font-bold",
        "bg-red-600 hover:bg-red-700 px-4 py-2 text-white font-semibold",
        className,
      )}
    >
      {children}
    </Button>
  );
};
