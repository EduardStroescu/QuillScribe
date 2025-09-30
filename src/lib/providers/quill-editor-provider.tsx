"use client";

import { useParams } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { type File } from "../supabase/supabase.types";
import { useDirectoryDetails } from "../hooks/useDirectoryDetails";
import type Quill from "quill";
import {
  type appFoldersType,
  type appWorkspacesType,
} from "../stores/app-store";

type QuillContextType =
  | {
      quill: Quill | null;
      setQuill: React.Dispatch<React.SetStateAction<Quill | null>>;
      fileId: string;
      dirDetails: appWorkspacesType;
      dirType: "workspace";
    }
  | {
      quill: Quill | null;
      setQuill: React.Dispatch<React.SetStateAction<Quill | null>>;
      fileId: string;
      dirDetails: appFoldersType;
      dirType: "folder";
    }
  | {
      quill: Quill | null;
      setQuill: React.Dispatch<React.SetStateAction<Quill | null>>;
      fileId: string;
      dirDetails: File;
      dirType: "file";
    };

type DirectoryArgs =
  | {
      dirType: "workspace";
      workspaceId: string;
      folderId?: undefined;
      fileId: string;
    }
  | { dirType: "folder"; workspaceId: string; folderId: string; fileId: string }
  | { dirType: "file"; workspaceId: string; folderId: string; fileId: string };

const QuillContext = createContext<QuillContextType | null>(null);

export const useQuillContext = () => {
  const context = useContext(QuillContext);
  if (!context)
    throw new Error("useQuillContext must be used inside QuillEditorProvider");
  return context;
};

export function QuillEditorProvider({ children }: { children: ReactNode }) {
  const [quill, setQuill] = useState<Quill | null>(null);

  const { fileId, folderId, workspaceId } = useParams<{
    fileId?: string;
    folderId?: string;
    workspaceId: string;
  }>();

  const dirType = fileId
    ? "file"
    : folderId
    ? "folder"
    : workspaceId
    ? "workspace"
    : ("workspace" as "workspace");

  const dirId = fileId || folderId || workspaceId;

  const args: DirectoryArgs =
    dirType === "file"
      ? { dirType: "file", workspaceId, folderId: folderId!, fileId: dirId }
      : dirType === "folder"
      ? { dirType: "folder", workspaceId, folderId: folderId!, fileId: dirId }
      : { dirType: "workspace", workspaceId: workspaceId!, fileId: dirId };

  const dirDetails = useDirectoryDetails(args);

  const value: QuillContextType = useMemo(() => {
    switch (dirType) {
      case "file":
        return {
          quill,
          setQuill,
          fileId: dirId,
          dirType: "file",
          dirDetails: dirDetails as File,
        };
      case "folder":
        return {
          quill,
          setQuill,
          fileId: dirId,
          dirType: "folder",
          dirDetails: dirDetails as appFoldersType,
        };
      case "workspace":
      default:
        return {
          quill,
          setQuill,
          fileId: dirId,
          dirType: "workspace",
          dirDetails: dirDetails as appWorkspacesType,
        };
    }
  }, [dirDetails, dirId, dirType, quill]);

  return (
    <QuillContext.Provider value={value}>{children}</QuillContext.Provider>
  );
}
