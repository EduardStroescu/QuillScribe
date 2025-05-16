import React from "react";
import { Background } from "../(site)/background";

interface TemplateProps {
  children: React.ReactNode;
}

const Template: React.FC<TemplateProps> = ({ children }) => {
  return (
    <div
      className="
      h-screen
      p-6 flex 
      justify-center"
    >
      <Background />
      {children}
    </div>
  );
};

export default Template;
