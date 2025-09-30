export const dynamic = "force-dynamic";

import ErrorComponent from "@/components/global/error-component";
import { ClientSetter } from "@/components/quill-editor/quill-client-setter";
import QuillEditor from "@/components/quill-editor/quill-editor";
import QuillHeader from "@/components/quill-editor/quill-header";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getFolders, getWorkspaceDetails } from "@/lib/supabase/queries";
import { type FC, type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: { workspaceId: string };
}

const Layout: FC<LayoutProps> = async ({ children, params }) => {
  const [
    { data: workspaceDetails, error: workspaceDetailsError },
    { data: workspaceFolders, error: foldersError },
  ] = await Promise.all([
    getWorkspaceDetails(params.workspaceId),
    getFolders(params.workspaceId),
  ]);

  if (
    workspaceDetailsError ||
    !workspaceDetails ||
    foldersError ||
    !workspaceFolders
  )
    return (
      <ErrorComponent
        message={
          workspaceDetailsError ||
          foldersError ||
          "Unexpected error. Please try again later!"
        }
      />
    );

  return (
    <>
      <ClientSetter
        dirDetails={workspaceDetails[0]}
        dirDetailsType="workspace"
        workspaceFolders={workspaceFolders}
      />
      <header className="flex h-16 shrink-0 w-full items-center gap-2 border-b overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="data-[orientation=vertical]:h-4"
          />
          <QuillHeader />
        </div>
      </header>
      <main className="flex flex-1 flex-col max-h-full overflow-y-auto">
        <div className="relative flex-1 rounded-2xl flex flex-col w-full">
          <QuillEditor />
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
