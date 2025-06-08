import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface TooltipButtonProps {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

export const TooltipButton = ({ children, label, onClick, className }: TooltipButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-lg flex items-center space-x-2 ${className}`}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
