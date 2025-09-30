"use client";

import {
  cloneElement,
  type ComponentProps,
  type Dispatch,
  type FC,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import clsx from "clsx";

interface CustomDialogTriggerProps
  extends Omit<ComponentProps<typeof DialogTrigger>, "content"> {
  header?: ReactNode | string;
  content?: ReactElement<{
    setOpen?: Dispatch<React.SetStateAction<boolean>>;
  }>;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

const CustomDialogTrigger: FC<CustomDialogTriggerProps> = forwardRef(
  function CustomDialogTrigger(
    { header, content, children, description, className, ...props },
    forwardedRef
  ) {
    const [open, setOpen] = useState(false);

    const contentWithProps = content
      ? cloneElement(content, { setOpen })
      : null;

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          ref={forwardedRef}
          {...props}
          className={clsx("", className)}
        >
          {children}
        </DialogTrigger>
        <DialogContent className="h-[100dvh] block sm:h-[440px] sm:max-h-max overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>{header}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {contentWithProps}
        </DialogContent>
      </Dialog>
    );
  }
);

export default CustomDialogTrigger;
