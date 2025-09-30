export const dynamic = "force-dynamic";

import { ClientSetter } from "@/components/quill-editor/quill-client-setter";
import { getFiles, getFolderDetails } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { workspaceId: string; folderId: string };
}) {
  const [
    { data: folderDetails, error: folderDetailsError },
    { data: files, error: filesError },
  ] = await Promise.all([
    getFolderDetails(params.folderId),
    getFiles(params.folderId),
  ]);

  if (folderDetailsError || !folderDetails || filesError || !files)
    redirect(`/dashboard/${params.workspaceId}`);

  return (
    <>
      <ClientSetter
        dirDetailsType="folder"
        dirDetails={folderDetails[0]}
        files={files}
      />
      {children}
    </>
  );
}
