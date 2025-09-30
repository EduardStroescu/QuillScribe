import { type FC, type ReactNode } from "react";
import { Background } from "../(site)/background";

interface TemplateProps {
  children: ReactNode;
}

const Template: FC<TemplateProps> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] p-6 flex justify-center">
      <Background />
      {children}
    </div>
  );
};

export default Template;
