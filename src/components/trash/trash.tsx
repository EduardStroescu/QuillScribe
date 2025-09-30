import { type ComponentProps, type FC, type ReactNode } from "react";
import CustomDialogTrigger from "../global/custom-dialog-trigger";
import TrashRestore from "./trash-restore";
import { DialogTrigger } from "../ui/dialog";

interface TrashProps extends ComponentProps<typeof DialogTrigger> {
  children: ReactNode;
}

const Trash: FC<TrashProps> = ({ children, ...props }) => {
  return (
    <CustomDialogTrigger {...props} header="Trash" content={<TrashRestore />}>
      {children}
    </CustomDialogTrigger>
  );
};

export default Trash;
