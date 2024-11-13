import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
interface TooltipComponentProps {
  children: React.ReactNode;
  message: string;
  asChild?: boolean;
}

const TooltipComponent: React.FC<TooltipComponentProps> = ({
  children,
  message,
  asChild,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipComponent;
