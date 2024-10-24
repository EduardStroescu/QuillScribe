import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Price } from "./supabase/supabase.types";
import { AppState } from "./providers/state-provider";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: Price) => {
  const priceString = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency || undefined,
    minimumFractionDigits: 0,
  }).format((price?.unitAmount || 0) / 100);
  return priceString;
};

export const getURL = () => {
  let url = process?.env?.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000/";

  url = url.includes("http") ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

export const postData = async ({
  url,
  data,
}: {
  url: string;
  data?: { price: Price };
}) => {
  const res: Response = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw Error(res.statusText);
  }
  return res.json();
};

export const toDateTime = (secs: number) => {
  const t = new Date("1970-01-01T00:30:00Z");
  t.setSeconds(secs);
  return t;
};

export const findWorkspaceById = (
  state: AppState,
  workspaceId: string | undefined
) => {
  return state.workspaces.find((workspace) => workspace.id === workspaceId);
};

export const findFolderById = (
  state: AppState,
  workspaceId: string | undefined,
  folderId: string | undefined
) => {
  return state.workspaces
    .find((workspace) => workspace.id === workspaceId)
    ?.folders.find((f) => f.id === folderId);
};

export const findFileById = (
  state: AppState,
  workspaceId: string | undefined,
  folderId: string | undefined,
  fileId: string | undefined
) => {
  return state.workspaces
    .find((workspace) => workspace.id === workspaceId)
    ?.folders.find((folder) => folder.id === folderId)
    ?.files.find((file) => file.id === fileId);
};
