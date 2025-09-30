import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Spinner fontSize={2}>{`Loading • Loading • Loading • `}</Spinner>
    </div>
  );
}
