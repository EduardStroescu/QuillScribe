"use client";

import React from "react";
import { Button } from "../ui/button";
import { actionLoginUser } from "@/lib/server-actions/auth-actions";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";

interface DemoAccontLoginProps {
  setSubmitError: React.Dispatch<React.SetStateAction<string>>;
}

const DemoAccountLogin: React.FC<DemoAccontLoginProps> = ({
  setSubmitError,
}) => {
  const router = useRouter();
  const handleDemoLogin = async (type: string) => {
    const email =
      type === "Pro"
        ? process.env.NEXT_PUBLIC_PRO_DEMO_EMAIL!
        : process.env.NEXT_PUBLIC_FREE_DEMO_EMAIL!;
    const password =
      type === "Pro"
        ? process.env.NEXT_PUBLIC_PRO_DEMO_PASS!
        : process.env.NEXT_PUBLIC_FREE_DEMO_PASS!;
    const { error } = await actionLoginUser({
      email,
      password,
    });
    if (error) {
      setSubmitError(error.message);
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <>
      <p className="text-center text-[#cac2ff]">Demo Accounts</p>
      <Separator />
      <Button
        type="button"
        className="bg-cyan-600"
        onClick={() => handleDemoLogin("Pro")}
      >
        Pro Account
      </Button>
      <Button
        type="button"
        className="bg-cyan-600"
        onClick={() => handleDemoLogin("Free")}
      >
        Free Account
      </Button>
    </>
  );
};

export default DemoAccountLogin;
