"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { LinkButton } from "../ui/link-button";

export default function ErrorComponent({
  message,
  safetyPath = "/dashboard",
  reset,
}: {
  message: string;
  safetyPath?: string;
  reset?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="absolute top-1/2 left-1/2 z-[999]">
      <Card className="-translate-y-[50%] -translate-x-[50%] w-max max-w-[80dvw]">
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
          <CardDescription className="text-red-600 animate-pulse">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-between items-center gap-2">
          <LinkButton
            variant="outline"
            size="sm"
            className="flex-1 items-center justify-center gap-1 text-nowrap"
            href={safetyPath}
            replace
          >
            <ArrowLeft className="size-[0.875rem]" />
            Return to safety
          </LinkButton>
          <Button
            onClick={() => (reset ? reset() : router.refresh())}
            size="sm"
            variant="btn-primary"
            className="flex-1 hover:cursor-pointer text-sm items-center justify-center gap-1 text-inherit hover:text-primary-foreground"
          >
            <RefreshCcw className="size-[0.875rem]" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
