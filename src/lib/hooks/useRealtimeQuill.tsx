import { useEffect, useMemo, useRef, useState } from "react";
import { updateFile, updateFolder, updateWorkspace } from "../supabase/actions";
import { useSupabaseUser } from "../providers/supabase-user-provider";
import { useSocket } from "../providers/socket-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "@/components/ui/use-toast";
import QuillCursors from "quill-cursors";
import { EmitterSource, Range } from "quill";
import { Delta } from "quill/core";
import { useQuillContext } from "../providers/quill-editor-provider";
import { useAppStore, useAppStoreActions } from "../stores/app-store";
import { type User } from "../supabase/supabase.types";
import { stringToColor } from "../color-generator";

const MAX_CONTENT_SIZE = 1024 * 1024; // 1MB

export function useRealtimeQuill() {
  const { quill, fileId, dirType, dirDetails } = useQuillContext();
  const {
    findFileById,
    findFolderById,
    findWorkspaceById,
    updateWorkspace: updateStateWorkspace,
    updateFolder: updateStateFolder,
    updateFile: updateStateFile,
  } = useAppStoreActions();
  const supabase = createClientComponentClient();
  const { user } = useSupabaseUser();
  const { socket, isConnected } = useSocket();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [saving, setSaving] = useState(false);
  const [collaborators, setCollaborators] = useState<
    Pick<User, "id" | "email" | "avatarUrl" | "updatedAt">[]
  >([]);

  // Connect to Socket.io Rooms
  useEffect(() => {
    if (socket === null || quill === null || !fileId) return;
    socket.emit("create-room", fileId);
  }, [socket, quill, fileId]);

  // Receive cursor position
  useEffect(() => {
    if (quill === null || socket === null || !fileId) return;

    const socketHandler = (range: Range, roomId: string, cursorId: string) => {
      if (roomId === fileId) {
        const cursorsModule = quill.getModule("cursors") as QuillCursors;
        const cursorToMove = cursorsModule
          .cursors()
          ?.find((c) => c.id === cursorId);
        if (cursorToMove) {
          cursorsModule.moveCursor(cursorId, range);
        }
      }
    };
    socket.on("receive-cursor-move", socketHandler);
    return () => {
      socket.off("receive-cursor-move", socketHandler);
    };
  }, [quill, socket, fileId]);

  // Send quill changes to all clients
  useEffect(() => {
    if (quill === null || socket === null || !fileId || !user?.id) return;

    const selectionChangeHandler =
      (cursorId: string) =>
      (range: Range, oldRange: Range, source: EmitterSource) => {
        if (source === "user" && cursorId) {
          socket.emit("send-cursor-move", range, fileId, cursorId);
        }
      };

    const quillHandler = (
      delta: Delta,
      oldDelta: Delta,
      source: EmitterSource
    ) => {
      if (source !== "user") return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);

      const contents = quill.getContents();
      const quillLength = quill.getLength();

      const jsonContents = JSON.stringify(contents);
      // Calculate size in bytes
      const sizeInBytes = new TextEncoder().encode(jsonContents).length;

      // Check if the document exceeds the maximum size allowed for the body of server actions and skip saving
      if (sizeInBytes > MAX_CONTENT_SIZE) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "The document exceeds 1MB and cannot be saved. Please reduce image or text size.",
        });
        return; // Skip saving
      }

      saveTimerRef.current = setTimeout(async () => {
        if (contents && quillLength >= 1 && fileId) {
          if (dirType == "workspace") {
            const currWorkspace = findWorkspaceById(fileId);
            updateStateWorkspace(fileId, {
              data: jsonContents,
            });
            const updateResponse = await updateWorkspace(
              {
                data: jsonContents,
                lastModifiedBy: useAppStore.getState().currentClientMutationId,
              },
              fileId
            );
            if (currWorkspace && updateResponse.error) {
              updateStateWorkspace(fileId, { data: currWorkspace.data });
              toast({
                variant: "destructive",
                title: "Error",
                description: updateResponse.error,
              });
            }
          }
          if (dirType == "folder") {
            const currFolder = findFolderById(dirDetails.workspaceId, fileId);
            updateStateFolder(dirDetails.workspaceId, fileId, {
              data: jsonContents,
            });
            const updateResponse = await updateFolder(
              {
                data: jsonContents,
                lastModifiedBy: useAppStore.getState().currentClientMutationId,
              },
              fileId
            );
            if (currFolder && updateResponse.error) {
              updateStateFolder(dirDetails.workspaceId, fileId, {
                data: currFolder.data,
              });
              toast({
                variant: "destructive",
                title: "Error",
                description: updateResponse.error,
              });
            }
          }
          if (dirType == "file") {
            const currFile = findFileById(
              dirDetails.workspaceId,
              dirDetails.folderId,
              fileId
            );
            updateStateFile(
              dirDetails.workspaceId,
              dirDetails.folderId,
              fileId,
              {
                data: jsonContents,
              }
            );
            const updateResponse = await updateFile(
              {
                data: jsonContents,
                lastModifiedBy: useAppStore.getState().currentClientMutationId,
              },
              fileId
            );
            if (currFile && updateResponse.error) {
              updateStateFile(
                dirDetails.workspaceId,
                dirDetails.folderId,
                fileId,
                {
                  data: currFile.data,
                }
              );
              toast({
                variant: "destructive",
                title: "Error",
                description: updateResponse.error,
              });
            }
          }
        }
        setSaving(false);
      }, 850);
      socket.emit("send-changes", delta, fileId);
    };

    quill.on("text-change", quillHandler);
    quill.on("selection-change", selectionChangeHandler(user.id));

    return () => {
      quill.off("text-change", quillHandler);
      quill.off("selection-change", selectionChangeHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    quill,
    socket,
    fileId,
    user?.id,
    dirDetails,
    dirType,
    findWorkspaceById,
    updateStateWorkspace,
    findFolderById,
    updateStateFolder,
    findFileById,
    updateStateFile,
  ]);

  // Retrieve Socket changes from all clients
  useEffect(() => {
    if (quill === null || socket === null) return;
    const socketHandler = (deltas: Delta, id: string) => {
      if (id === fileId) {
        quill.updateContents(deltas);
      }
    };
    socket.on("receive-changes", socketHandler);
    return () => {
      socket.off("receive-changes", socketHandler);
    };
  }, [quill, socket, fileId]);

  // Supabase realtime collaborator sync
  useEffect(() => {
    if (!fileId || !quill || !user?.id) return;

    const room = supabase.channel(fileId);

    const updatePresence = () => {
      const state = room.presenceState();
      const allConnections = Object.values(
        state
      ).flat() as unknown as typeof collaborators;

      const uniqueCollaboratorsMap = new Map<
        string,
        (typeof allConnections)[0]
      >();
      allConnections.forEach((c) => uniqueCollaboratorsMap.set(c.id, c));
      const uniqueCollaborators = Array.from(uniqueCollaboratorsMap.values());

      setCollaborators((prev) => {
        // Check if the new array is different by ID
        const isEqual =
          prev.length === uniqueCollaborators.length &&
          prev.every((p, i) => p.id === uniqueCollaborators[i].id);

        if (isEqual) return prev; // skip update
        return uniqueCollaborators;
      });

      // Manage cursors
      const cursorsModule = quill.getModule("cursors") as QuillCursors;
      const existingCursorIds = cursorsModule.cursors().map((c) => c.id);

      // Add/update cursors for active collaborators
      uniqueCollaborators.forEach((collab) => {
        if (collab.id === user.id) return;

        if (!existingCursorIds.includes(collab.id)) {
          cursorsModule.createCursor(
            collab.id,
            collab.email.split("@")[0],
            stringToColor(collab.id)
          );
        }
      });

      // Remove cursors for users who left
      existingCursorIds.forEach((cursorId) => {
        if (!uniqueCollaborators.find((c) => c.id === cursorId)) {
          cursorsModule.removeCursor(cursorId);
        }
      });
    };

    const subscription = room
      .on("presence", { event: "sync" }, updatePresence)
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") return;

        // Track current user
        room.track({
          id: user.id,
          email: user.email?.split("@")[0],
          avatarUrl: user.avatarUrl,
          updatedAt: user.updatedAt,
        });
      });

    // Initial update
    updatePresence();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(room);
    };
  }, [
    fileId,
    quill,
    supabase,
    user?.id,
    user?.email,
    user?.avatarUrl,
    user?.updatedAt,
  ]);

  return useMemo(
    () => ({ collaborators, setCollaborators, saving, isConnected }),
    [collaborators, setCollaborators, saving, isConnected]
  );
}
