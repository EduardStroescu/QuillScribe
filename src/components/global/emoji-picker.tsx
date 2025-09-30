"use client";

import dynamic from "next/dynamic";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EmojiClickData, Theme } from "emoji-picker-react";
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  forwardRef,
  memo,
} from "react";

const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface EmojiPickerProps extends ComponentProps<typeof PopoverTrigger> {
  children: ReactNode;
  getValue?: (emoji: string) => void;
}

const EmojiPicker = memo(
  forwardRef<HTMLButtonElement, EmojiPickerProps>(function EmojiPicker(
    { children, getValue, ...props },
    ref
  ) {
    const onClick = useCallback(
      (selectedEmoji: EmojiClickData) => {
        if (getValue) getValue(selectedEmoji.emoji);
      },
      [getValue]
    );

    return (
      <div className="flex items-center">
        <Popover>
          <PopoverTrigger ref={ref} {...props}>
            {children}
          </PopoverTrigger>
          <PopoverContent className="p-0 border-none">
            <Picker onEmojiClick={onClick} theme={Theme.AUTO} />
          </PopoverContent>
        </Popover>
      </div>
    );
  })
);

export default EmojiPicker;
