import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type File, type Price } from "./supabase/supabase.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  type appFoldersType,
  type appWorkspacesType,
} from "./stores/app-store";

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

export const getStripeRedirectUrl = () => {
  let url = process?.env?.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000/";

  url = url.includes("http") ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

export const createStripePortalLink = async ({
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

export const getSupabaseImageUrl = (
  from: "file-banners" | "workspace-logos" | "avatars",
  basePath: string | null,
  version?: string | number | null
) => {
  try {
    if (!basePath) return "";

    const supabase = createClientComponentClient();
    const url = supabase.storage.from(from).getPublicUrl(basePath)
      ?.data?.publicUrl;

    if (!url) return "";

    return version ? `${url}?v=${encodeURIComponent(version)}` : url;
  } catch {
    return "";
  }
};

// Type guards
export const isFile = (
  d: appWorkspacesType | appFoldersType | File,
  dirType: "workspace" | "folder" | "file"
): d is File => dirType === "file";

export const isFolder = (
  d: appWorkspacesType | appFoldersType | File,
  dirType: "workspace" | "folder" | "file"
): d is appFoldersType => dirType === "folder";
