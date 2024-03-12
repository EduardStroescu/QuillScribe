"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-4 text-red-600 text-lg">
      <h2>We are sorry, something went wrong! Please try again later!</h2>
      <Button
        variant="destructive"
        size="lg"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
