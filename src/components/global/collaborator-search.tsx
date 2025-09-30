"use client";

import { type Collaborator } from "@/lib/supabase/supabase.types";
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

type CollaboratorWithAvatar = Collaborator;

interface CollaboratorSearchProps {
  existingCollaborators: Collaborator[];
  getCollaborator: (collaborator: Collaborator) => void;
  children: ReactNode;
}

const CollaboratorSearch: FC<CollaboratorSearchProps> = ({
  children,
  existingCollaborators,
  getCollaborator,
}) => {
  const [searchResults, setSearchResults] = useState<CollaboratorWithAvatar[]>(
    []
  );
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
        const users: Collaborator[] = await res.json();
        setSearchResults(
          users.filter(
            (result) =>
              !existingCollaborators.some(
                (existing) => existing.id === result.id
              )
          )
        );
      } catch {
        setSearchResults([]);
      }
    }, 450);
  };

  const addCollaborator = (user: Collaborator) => {
    getCollaborator(user);
  };

  return (
    <Sheet>
      <SheetTrigger asChild className="mx-auto my-4">
        {children}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>Search Collaborator</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            You can also remove collaborators after adding them from the
            settings tab.
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
          {searchResults.map((collaborator) => {
            return (
              <div
                key={collaborator.id}
                className="my-4 px-4 flex justify-between items-center"
              >
                <div className="flex gap-4 items-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={getSupabaseImageUrl(
                        "avatars",
                        collaborator.avatarUrl,
                        collaborator.updatedAt
                      )}
                      alt={`${collaborator?.email}'s Avatar`}
                    />
                    <AvatarFallback>
                      {collaborator?.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm gap-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                    {collaborator.email}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => addCollaborator(collaborator)}
                >
                  Add
                </Button>
              </div>
            );
          })}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CollaboratorSearch;
