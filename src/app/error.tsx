"use client";

import ErrorComponent from "@/components/global/error-component";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorComponent
      message={"We are sorry, something went wrong! Please try again later!"}
      reset={reset}
      safetyPath="/"
    />
  );
}
