import SignupForm from "@/components/signup/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signup",
};

const Signup = () => {
  return <SignupForm />;
};

export default Signup;
