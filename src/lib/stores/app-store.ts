import { create } from "zustand";
import { v4 as uuid } from "uuid";
import {
  type File,
  type Folder,
  type Workspace,
} from "../supabase/supabase.types";

export type appFoldersType = Folder & { files: File[] };
export type appWorkspacesType = Workspace & {
  folders: appFoldersType[];
};

export interface AppState {
  workspaces: appWorkspacesType[];
  currentClientMutationId: string;

  actions: {
    findWorkspaceById: (workspaceId: string) => appWorkspacesType | undefined;
    findFolderById: (
      workspaceId: string,
      folderId: string
    ) => appFoldersType | undefined;
    findFileById: (
      workspaceId: string,
      folderId: string,
      fileId: string
    ) => File | undefined;

    setWorkspaces: (workspaces: appWorkspacesType[]) => void;
    addWorkspace: (workspace: appWorkspacesType) => void;
    deleteWorkspace: (workspaceId: string) => void;
    updateWorkspace: (
      workspaceId: string,
      workspace: Partial<appWorkspacesType>
    ) => void;
    addFolder: (workspaceId: string, folder: appFoldersType) => void;
    updateFolder: (
      workspaceId: string,
      folderId: string,
      folder: Partial<appFoldersType>
    ) => void;
    deleteFolder: (workspaceId: string, folderId: string) => void;
    setFolders: (workspaceId: string, folders: appFoldersType[]) => void;
    addFile: (workspaceId: string, folderId: string, file: File) => void;
    updateFile: (
      workspaceId: string,
      folderId: string,
      fileId: string,
      file: Partial<File>
    ) => void;
    deleteFile: (workspaceId: string, folderId: string, fileId: string) => void;
    setFiles: (workspaceId: string, folderId: string, files: File[]) => void;
    resetStore: () => void;
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  workspaces: [],
  currentClientMutationId: uuid(), // Metadata column added to not rerender unnecessarily on mutations done by the same client

  actions: {
    findWorkspaceById: (workspaceId) =>
      get().workspaces.find((workspace) => workspace.id === workspaceId),
    findFolderById: (workspaceId, folderId) =>
      get()
        .workspaces.find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId),
    findFileById: (workspaceId, folderId, fileId) =>
      get()
        .workspaces.find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId)
        ?.files.find((file) => file.id === fileId),

    addWorkspace: (workspace) =>
      set((state) => ({ workspaces: [...state.workspaces, workspace] })),

    deleteWorkspace: (workspaceId) =>
      set((state) => ({
        workspaces: state.workspaces.filter((w) => w.id !== workspaceId),
      })),

    updateWorkspace: (workspaceId, workspace) =>
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === workspaceId ? { ...w, ...workspace } : w
        ),
      })),

    setWorkspaces: (workspaces) => set({ workspaces }),

    setFolders: (workspaceId, folders) =>
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                folders: [...folders].sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                ),
              }
            : w
        ),
      })),

    addFolder: (workspaceId, folder) =>
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                folders: [...w.folders, folder].sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                ),
              }
            : w
        ),
      })),

    updateFolder: (workspaceId, folderId, folder) =>
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                folders: w.folders.map((f) =>
                  f.id === folderId ? { ...f, ...folder } : f
                ),
              }
            : w
        ),
      })),

    deleteFolder: (workspaceId, folderId) =>
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === workspaceId
            ? { ...w, folders: w.folders.filter((f) => f.id !== folderId) }
            : w
        ),
      })),

    setFiles: (workspaceId, folderId, files) =>
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                folders: w.folders.map((f) =>
                  f.id === folderId ? { ...f, files } : f
                ),
              }
            : w
        ),
      })),

    addFile: (workspaceId, folderId, file) =>
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                folders: w.folders.map((f) =>
                  f.id === folderId
                    ? {
                        ...f,
                        files: [...f.files, file].sort(
                          (a, b) =>
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime()
                        ),
                      }
                    : f
                ),
              }
            : w
        ),
      })),

    updateFile: (workspaceId, folderId, fileId, file) =>
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                folders: w.folders.map((f) =>
                  f.id === folderId
                    ? {
                        ...f,
                        files: f.files.map((fl) =>
                          fl.id === fileId ? { ...fl, ...file } : fl
                        ),
                      }
                    : f
                ),
              }
            : w
        ),
      })),

    deleteFile: (workspaceId, folderId, fileId) =>
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                folders: w.folders.map((f) =>
                  f.id === folderId
                    ? { ...f, files: f.files.filter((fl) => fl.id !== fileId) }
                    : f
                ),
              }
            : w
        ),
      })),

    resetStore: () => set({ workspaces: [] }),
  },
}));

export const useAppStoreActions = () => useAppStore((state) => state.actions);

export const selectWorkspaceById =
  (workspaceId: string | undefined, withData = false) =>
  (state: AppState) => {
    const workspace = state.workspaces.find((w) => w.id === workspaceId);
    if (!workspace) return undefined;
    if (withData) return workspace;
    const { data, ...rest } = workspace;
    return rest;
  };

export const selectFolderById =
  (
    workspaceId: string | undefined,
    folderId: string | undefined,
    withData = false
  ) =>
  (state: AppState) => {
    const folder = state.workspaces
      .find((w) => w.id === workspaceId)
      ?.folders.find((f) => f.id === folderId);
    if (!folder) return undefined;
    if (withData) return folder;
    const { data, ...rest } = folder;
    return rest;
  };

export const selectFileById =
  (
    workspaceId: string | undefined,
    folderId: string | undefined,
    fileId: string | undefined,
    withData = false
  ) =>
  (state: AppState) => {
    const file = state.workspaces
      .find((w) => w.id === workspaceId)
      ?.folders.find((f) => f.id === folderId)
      ?.files.find((fl) => fl.id === fileId);
    if (!file) return undefined;
    if (withData) return file;
    const { data, ...rest } = file;
    return rest;
  };
