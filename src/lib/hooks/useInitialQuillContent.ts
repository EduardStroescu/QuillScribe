import { useEffect, useRef } from "react";
import Quill from "quill";
import {
  type appFoldersType,
  type appWorkspacesType,
} from "../stores/app-store";
import { type File } from "../supabase/supabase.types";
import { toast } from "@/components/ui/use-toast";
import { type Delta } from "quill/core";

interface useQuillDataSync {
  quill: Quill | null;
  dirDetails: appWorkspacesType | appFoldersType | File;
}

export function useInitialQuillContent({
  quill,
  dirDetails,
}: useQuillDataSync) {
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!quill) {
      initializedRef.current = null;
      return;
    }

    if (initializedRef.current === dirDetails.id) return;

    try {
      const quillData: Delta = dirDetails?.data
        ? JSON.parse(dirDetails.data)
        : [];
      quill.setContents(quillData);
      initializedRef.current = dirDetails.id;
    } catch {
      toast({
        title: "Error",
        description: "Could not load the file. Please try again later.",
      });
    }
  }, [dirDetails?.data, quill, dirDetails.id]);
}
