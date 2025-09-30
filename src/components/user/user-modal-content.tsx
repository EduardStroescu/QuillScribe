import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { getSupabaseImageUrl, createStripePortalLink } from "@/lib/utils";
import { useState } from "react";
import { toast } from "../ui/use-toast";
import { updateUser } from "@/lib/supabase/actions";
import { useRouter } from "next/navigation";
import { CreditCard, ExternalLink } from "lucide-react";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import QuillScribeProfileIcon from "../icons/quillScribeProfileIcon";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Link from "next/link";
import { Button } from "../ui/button";
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";
import { uploadFile } from "@/lib/supabase/uploadFile";

export default function UserModalContent() {
  const { user, subscription } = useSupabaseUser();
  const { setOpen: setSubscriptionModalOpen } = useSubscriptionModal();
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState(() =>
    getSupabaseImageUrl("avatars", user?.avatarUrl ?? null, user?.updatedAt)
  );
  const [loadingPortal, setLoadingPortal] = useState(false);
  const router = useRouter();

  const redirectToCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const { url } = await createStripePortalLink({
        url: "/api/create-portal-link",
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later!",
        variant: "destructive",
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  const onChangeProfilePicture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfilePic(true);
    const { publicPath: avatar } = await uploadFile(
      "avatars",
      file,
      `avatar.${user?.id}`
    );

    if (avatar) {
      const { data: updatedUser } = await updateUser({ avatarUrl: avatar });

      if (updatedUser?.avatarUrl) {
        setUserProfilePicture(
          getSupabaseImageUrl(
            "avatars",
            updatedUser.avatarUrl,
            updatedUser.updatedAt
          )
        );
        router.refresh();
        toast({
          title: "Success",
          description: "Profile picture updated.",
        });
      }
      setUploadingProfilePic(false);
      return;
    }
    setUploadingProfilePic(false);
    toast({
      title: "Error",
      description:
        "Unable to upload profile picture at this time. Please try again later!",
      variant: "destructive",
    });
  };

  const removeAvatar = async () => {
    if (!user?.avatarUrl) return;
    const currAvatar = user.avatarUrl;
    setUserProfilePicture("");
    const removeResponse = await updateUser({ avatarUrl: null });
    if (removeResponse.error) {
      setUserProfilePicture(currAvatar);
      toast({
        title: "Error",
        description: removeResponse.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Success", description: "Profile picture removed." });
    router.refresh();
  };

  return (
    <div className="flex gap-4 flex-col mt-4">
      <div className="flex items-center">
        <Avatar>
          <AvatarImage
            src={userProfilePicture}
            alt={`${user?.email.split("@")[0] || "User"}'s Avatar`}
          />
          <AvatarFallback>
            <QuillScribeProfileIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col ml-6">
          <small className="text-muted-foreground">
            {user ? user.email : ""}
          </small>
          <Label
            htmlFor="profilePicture"
            className="text-sm text-muted-foreground"
          >
            Profile Picture
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              name="profilePicture"
              type="file"
              accept="image/*"
              placeholder="Profile Picture"
              onChange={onChangeProfilePicture}
              disabled={uploadingProfilePic}
            />
            <Button
              disabled={!user?.avatarUrl || uploadingProfilePic}
              variant="destructive"
              className="text-destructive-foreground min-w-max"
              onClick={removeAvatar}
            >
              Remove Logo
            </Button>
          </div>
        </div>
      </div>
      <p className="flex items-center gap-2">
        <CreditCard size={20} /> Billing & Plan
      </p>
      <Separator />
      <p className="text-muted-foreground">
        You are currently on the{" "}
        {subscription?.status === "active" ? "Pro" : "Free"} Plan
      </p>
      <Link
        href="/#pricing"
        className="text-muted-foreground flex flex-row items-center gap-2 max-w-max ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
      >
        View Plans <ExternalLink size={16} />
      </Link>
      {subscription?.status === "active" ? (
        <div>
          <Button
            type="button"
            size="sm"
            variant={"secondary"}
            disabled={loadingPortal}
            className="text-sm"
            onClick={redirectToCustomerPortal}
          >
            {loadingPortal ? "Processing..." : "Manage Subscription"}
          </Button>
        </div>
      ) : (
        <div>
          <Button
            type="button"
            size="sm"
            variant={"secondary"}
            className="text-sm"
            onClick={() => setSubscriptionModalOpen(true)}
          >
            Start Plan
          </Button>
        </div>
      )}
    </div>
  );
}
