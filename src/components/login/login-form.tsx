"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema } from "@/lib/types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import Image from "next/image";
import Logo from "/public/quillScribeLogo.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/global/loader";
import { actionLoginUser } from "@/lib/server-actions/auth-actions";
import DemoAccountLogin from "./demo-account-login";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";

const LoginForm = () => {
  const { syncUser } = useSupabaseUser();
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "", password: "" },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (
    formData
  ) => {
    const { error, data } = await actionLoginUser(formData);
    if (error) {
      form.reset();
      setSubmitError(error.message);
    } else if (data?.session) {
      syncUser(data.session);
      router.replace("/dashboard");
    }
  };

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError("");
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
      >
        <Link
          href="/"
          className="w-full flex justify-left items-center rounded ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Image
            src={Logo}
            alt="QuillScribe Logo"
            width={100}
            height={100}
            style={{ width: "100px", height: "100px" }}
            priority
          />
          <span className="font-semibold text-white text-4xl first-letter:ml-2">
            QuillScribe.
          </span>
        </Link>
        <FormDescription className="text-[#cac2ff99]">
          An all-In-One Collaboration and Productivity Platform
        </FormDescription>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitError && <FormMessage>{submitError}</FormMessage>}
        <Button
          type="submit"
          className="w-full p-6"
          size="lg"
          disabled={isLoading}
        >
          {!isLoading ? "Login" : <Loader />}
        </Button>
        <div className="text-[#cac2ff] flex gap-2">
          <span>{"Don't have an account?"}</span>
          <Link
            href="/signup"
            className="text-primary rounded ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign Up
          </Link>
        </div>
        <DemoAccountLogin setSubmitError={setSubmitError} />
      </form>
    </Form>
  );
};

export default LoginForm;
