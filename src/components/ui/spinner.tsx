import { cn } from "@/lib/utils";
import { type CSSProperties } from "react";

type SpinningTextProps = {
  children: string;
  style?: CSSProperties;
  duration?: number;
  className?: string;
  reverse?: boolean;
  fontSize?: number;
  radius?: number;
};

export function Spinner({
  children,
  duration = 6000,
  style,
  className,
  reverse = false,
  fontSize = 1,
  radius = 5,
}: SpinningTextProps) {
  const letters = children.split("");
  const totalLetters = letters.length;

  return (
    <div
      className={cn("relative animate-[spin]", className)}
      style={{
        animationDuration: `${duration}ms`,
        animationDirection: reverse ? "reverse" : "normal",
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        ...style,
      }}
    >
      {letters.map((letter, index) => (
        <span
          aria-hidden="true"
          key={`${index}-${letter}`}
          className="absolute z-[999999] left-1/2 top-1/2 inline-block starting:opacity-0 opacity-100 transition-opacity"
          style={
            {
              "--index": index,
              "--total": totalLetters,
              "--font-size": fontSize,
              "--radius": radius,
              fontSize: `calc(var(--font-size, 2) * 1rem)`,
              transform: `
                  translate(-50%, -50%)
                  rotate(calc(360deg / var(--total) * var(--index)))
                  translateY(calc(var(--radius, 5) * -1ch))
                `,
              transformOrigin: "center",
              transitionDelay: `${index * 50}ms`,
              transitionDuration: `750ms`,
            } as CSSProperties
          }
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
      <span className="sr-only">{children}</span>
    </div>
  );
}
