"use client";

import { useAppState } from "@/lib/providers/state-provider";
import { workspace } from "@/lib/supabase/supabase.types";
import React, { useEffect, useState } from "react";
import SelectedWorkspace from "./selected-workspace";
import CustomDialogTrigger from "../global/custom-dialog-trigger";
import WorkspaceCreator from "../global/workspace-creator";
import { findWorkspaceById } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Link from "next/link";

interface WorkspaceDropdownProps {
  privateWorkspaces: workspace[] | [];
  sharedWorkspaces: workspace[] | [];
  collaboratingWorkspaces: workspace[] | [];
  defaultValue: workspace | undefined;
}

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({
  privateWorkspaces,
  collaboratingWorkspaces,
  sharedWorkspaces,
  defaultValue,
}) => {
  const { dispatch, state } = useAppState();
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch({
      type: "SET_WORKSPACES",
      payload: {
        workspaces: [
          ...privateWorkspaces,
          ...sharedWorkspaces,
          ...collaboratingWorkspaces,
        ].map((workspace) => ({ ...workspace, folders: [] })),
      },
    });
  }, [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces, dispatch]);

  const handleSelect = (option: workspace) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const findSelectedWorkspace = findWorkspaceById(state, defaultValue?.id);
    if (findSelectedWorkspace) setSelectedOption(findSelectedWorkspace);
  }, [state, defaultValue]);

  return (
    <Popover>
      <PopoverTrigger className="text-left">
        {selectedOption ? (
          <SelectedWorkspace workspace={selectedOption} />
        ) : (
          "Select a workspace"
        )}
      </PopoverTrigger>
      <PopoverContent
        className="
          w-full
          rounded-md
          shadow-md
          z-50
          h-[190px]
          bg-black/10
          backdrop-blur-lg
          group
          overflow-y-auto
          overflow-x-hidden
          border-[1px]
          border-muted
          px-0 py-2
      "
      >
        <div className="rounded-md flex flex-col px-2">
          {!!privateWorkspaces.length && (
            <>
              <p className="text-muted-foreground">Private</p>
              <hr></hr>
              {privateWorkspaces.map((option) => (
                <Link
                  key={option.id}
                  href={`/dashboard/${option.id}`}
                  onClick={() => handleSelect(option)}
                >
                  <SelectedWorkspace workspace={option} />
                </Link>
              ))}
            </>
          )}
          {!!sharedWorkspaces.length && (
            <>
              <p className="text-muted-foreground">Shared</p>
              <hr />
              {sharedWorkspaces.map((option) => (
                <Link
                  key={option.id}
                  href={`/dashboard/${option.id}`}
                  onClick={() => handleSelect(option)}
                >
                  <SelectedWorkspace workspace={option} />
                </Link>
              ))}
            </>
          )}
          {!!collaboratingWorkspaces.length && (
            <>
              <p className="text-muted-foreground">Collaborating</p>
              <hr />
              {collaboratingWorkspaces.map((option) => (
                <Link
                  key={option.id}
                  href={`/dashboard/${option.id}`}
                  onClick={() => handleSelect(option)}
                >
                  <SelectedWorkspace workspace={option} />
                </Link>
              ))}
            </>
          )}
          <CustomDialogTrigger
            header="Create A Workspace"
            content={<WorkspaceCreator />}
            description="Workspaces give you the power to collaborate with others. You can change your workspace privacy settings after creating the workspace too."
          >
            <div
              className="flex 
              transition-all 
              hover:bg-muted 
              justify-center 
              items-center 
              gap-2 
              p-2 
              w-full"
            >
              <article
                className="text-slate-500 
                rounded-full
                 bg-slate-800 
                 w-4 
                 h-4 
                 flex 
                 items-center 
                 justify-center"
              >
                +
              </article>
              Create workspace
            </div>
          </CustomDialogTrigger>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WorkspaceDropdown;
