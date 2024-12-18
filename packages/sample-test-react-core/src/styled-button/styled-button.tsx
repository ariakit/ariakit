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
        "bg-blue-600 text-white hover:bg-blue-700 font-bold px-3 py-2 text-lg",
        className,
      )}
    >
      {children}
    </Button>
  );
};
