"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "../ui/sidebar";

const PLACEHOLDER_NUMBER = 6;

export default function FoldersDropdownListSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="justify-between">FOLDERS</SidebarGroupLabel>
      <SidebarMenu>
        {Array.from({ length: PLACEHOLDER_NUMBER }).map((_, idx) => (
          <SidebarMenuItem key={idx}>
            <SidebarMenuSkeleton showIcon className="cursor-pointer" />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
