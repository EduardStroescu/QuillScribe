import { type FC, type ReactNode, type ComponentProps } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
interface TooltipComponentProps extends ComponentProps<typeof TooltipTrigger> {
  children: ReactNode;
  message: string;
}

const TooltipComponent: FC<TooltipComponentProps> = ({
  children,
  message,
  ...props
}) => {
  return (
    <Tooltip>
      <TooltipTrigger {...props}>{children}</TooltipTrigger>
      <TooltipContent>{message}</TooltipContent>
    </Tooltip>
  );
};

export default TooltipComponent;
