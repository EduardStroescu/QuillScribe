import { type ComponentProps, type FC, type ReactNode } from "react";
import CustomDialogTrigger from "../global/custom-dialog-trigger";
import SettingsForm from "./settings-form";
import { DialogTrigger } from "../ui/dialog";

interface SettingsProps extends ComponentProps<typeof DialogTrigger> {
  children: ReactNode;
}

const Settings: FC<SettingsProps> = ({ children, ...props }) => {
  return (
    <CustomDialogTrigger
      {...props}
      header="Settings"
      content={<SettingsForm />}
    >
      {children}
    </CustomDialogTrigger>
  );
};

export default Settings;
