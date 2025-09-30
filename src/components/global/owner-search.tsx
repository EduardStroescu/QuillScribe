"use client";

import { Collaborator } from "@/lib/supabase/supabase.types";
import {
  type ChangeEvent,
  type FC,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { getSupabaseImageUrl } from "@/lib/utils";

interface OwnerSearchProps {
  getOwner: (owner: Collaborator) => void;
  children: ReactNode;
}

const OwnerSearch: FC<OwnerSearchProps> = ({ children, getOwner }) => {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Collaborator[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        if (!e.target.value) {
          setSearchResults([]);
          return;
        }
        const res = await fetch(`/api/search?email=${e.target.value}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const owners: Collaborator[] = await res.json();
        setSearchResults(owners);
      } catch {
        setSearchResults([]);
      }
    }, 450);
  };

  const transferOwnership = (user: Collaborator) => {
    getOwner(user);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>Transfer Ownership</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Select a new owner for this workspace.
          </SheetDescription>
        </SheetHeader>
        <div className="flex justify-center items-center gap-2">
          <Search />
          <Input
            name="name"
            className="dark:bg-background"
            placeholder="Email"
            onChange={onChangeHandler}
          />
        </div>
        <ScrollArea className="w-full h-full rounded-md">
          {searchResults.map((owner) => {
            return (
              <div
                key={owner.id}
                className="my-4 px-4 flex justify-between items-center"
              >
                <div className="flex gap-4 items-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={getSupabaseImageUrl(
                        "avatars",
                        owner.avatarUrl,
                        owner.updatedAt
                      )}
                      alt={`${owner?.email}'s Avatar`}
                    />
                    <AvatarFallback>
                      {owner?.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm gap-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                    {owner.email}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => transferOwnership(owner)}
                >
                  Entrust
                </Button>
              </div>
            );
          })}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default OwnerSearch;
