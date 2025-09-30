import { useParams, usePathname } from "next/navigation";
import {
  useAppStore,
  selectWorkspaceById,
  selectFolderById,
  selectFileById,
} from "../stores/app-store";

export function useDirectoryBreadcrumbs() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter((val) => val !== "dashboard" && val);

  const folderId = segments[1];
  const fileId = segments[2];

  const breadcrumb = useAppStore((state) => {
    const workspace = selectWorkspaceById(workspaceId)(state);
    if (!workspace) return "";

    const folder = folderId
      ? selectFolderById(workspaceId, folderId)(state)
      : null;
    const file = fileId
      ? selectFileById(workspaceId, folderId, fileId)(state)
      : null;

    const workspaceBreadCrumb = `${workspace.iconId} ${workspace.title}`;
    const folderBreadCrumb = folder ? `/ ${folder.iconId} ${folder.title}` : "";
    const fileBreadCrumb = file ? `/ ${file.iconId} ${file.title}` : "";

    return `${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`;
  });

  return breadcrumb;
}
