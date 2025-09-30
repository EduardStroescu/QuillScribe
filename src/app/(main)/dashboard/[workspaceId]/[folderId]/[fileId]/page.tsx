export const dynamic = "force-dynamic";

import { getFileDetails } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { ClientSetter } from "@/components/quill-editor/quill-client-setter";

const File = async ({
  params,
}: {
  params: { folderId: string; fileId: string };
}) => {
  const { data: fileDetails, error: fileDetailsError } = await getFileDetails(
    params.fileId
  );
  if (fileDetailsError || !fileDetails)
    redirect(`/dashboard/${params.folderId}`);

  return <ClientSetter dirDetails={fileDetails[0]} dirDetailsType="file" />;
};

export default File;
