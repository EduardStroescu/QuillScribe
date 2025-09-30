"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import TooltipComponent from "./tooltip-component";
import { Skeleton } from "../ui/skeleton";

const ModeToggle = () => {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure hydration consistency
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent SSR mismatch by rendering nothing or a placeholder
    return (
      <Button variant="outline" size="default">
        <Skeleton className="h-[1.2rem] w-[1.2rem] bg-sidebar-accent bg-sidebar-grain bg-blend-overlay" />
      </Button>
    );
  }

  return (
    <TooltipComponent
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      message={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      asChild
    >
      <Button
        variant="outline"
        size="default"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="text-accent-foreground/80 focus-visible:ring-sidebar-ring"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </TooltipComponent>
  );
};

export default ModeToggle;
