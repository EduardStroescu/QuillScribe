"use client";

import { workspace } from "@/lib/supabase/supabase.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface SelectedWorkspaceProps {
  workspace: workspace;
}

const SelectedWorkspace: React.FC<SelectedWorkspaceProps> = ({ workspace }) => {
  const supabase = createClientComponentClient();
  const [workspaceLogo, setWorkspaceLogo] = useState("/quillScribeLogo.svg");
  useEffect(() => {
    if (workspace.logo) {
      const path = supabase.storage
        .from("workspace-logos")
        .getPublicUrl(workspace.logo)?.data.publicUrl;
      setWorkspaceLogo(path);
    }
  }, [workspace, supabase]);

  return (
    <div
      className="flex 
      rounded-md 
      hover:bg-muted 
      transition-all 
      flex-row 
      py-2
      px-3 
      gap-4 
      justify-center 
      cursor-pointer 
      items-center 
      my-2"
    >
      <Image
        src={workspaceLogo}
        alt="workspace logo"
        width={20}
        height={20}
        style={{ objectFit: "cover", width: "auto", height: "auto" }}
      />
      <div className="flex flex-col">
        <p
          className="text-lg 
        w-[170px] 
        overflow-hidden 
        overflow-ellipsis 
        whitespace-nowrap"
        >
          {workspace.title}
        </p>
      </div>
    </div>
  );
};

export default SelectedWorkspace;
