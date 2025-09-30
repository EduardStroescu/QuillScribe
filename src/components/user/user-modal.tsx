import { type FC } from "react";
import UserModalContent from "./user-modal-content";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { UserIcon } from "lucide-react";
import { Separator } from "../ui/separator";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserModal: FC<UserModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[100dvh] block sm:h-[440px] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <UserIcon size={20} /> Profile
            </div>
            <Separator className="mt-4" />
          </DialogTitle>
        </DialogHeader>
        <UserModalContent />
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
