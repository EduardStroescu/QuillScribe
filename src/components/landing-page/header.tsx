"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import Logo from "../../../public/quillScribeLogo.svg";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const Header = () => {
  const [path, setPath] = useState("#products");
  return (
    <header
      className="p-4
      flex
      justify-between
      items-center
  "
    >
      <Link
        href={"/"}
        className="min-w-fit w-fit flex gap-2
        justify-left items-center"
      >
        <Image
          src={Logo}
          alt="QuillScribe Logo"
          priority
          width={100}
          height={100}
          style={{ width: "100px", height: "100px" }}
        />
        <span
          className="font-semibold
          dark:text-white
        "
        >
          QuillScribe.
        </span>
      </Link>
      <NavigationMenu className="hidden md:block">
        <NavigationMenuList className="gap-6">
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn({
                "dark:text-white": path === "#pricing",
                "dark:text-white/40": path !== "#pricing",
                "font-normal": true,
                "text-xl": true,
              })}
            >
              Pricing
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4  md:grid-row-2  ">
                <ListItem
                  onClick={() => setPath("#pricing")}
                  title="Pro Plan"
                  href="#pricing"
                >
                  Unlock the full power of collaboration.
                </ListItem>
                <ListItem
                  onClick={() => setPath("#pricing")}
                  title="Free Plan"
                  href="#pricing"
                >
                  Great for teams just starting out.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              onClick={() => setPath("#testimonials")}
              href="#testimonials"
              className={cn(navigationMenuTriggerStyle(), {
                "dark:text-white": path === "#testimonials",
                "dark:text-white/40": path !== "#testimonials",
                "font-normal": true,
                "text-xl": true,
                "cursor-pointer": true,
              })}
            >
              Testimonials
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <aside
        className="flex
        gap-2
        justify-end
      "
      >
        <Link href={"/login"}>
          <Button variant="btn-secondary" className="p-1 hidden sm:block">
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button variant="btn-primary" className="whitespace-nowrap">
            Sign Up
          </Button>
        </Link>
      </aside>
    </header>
  );
};

export default Header;

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "group block select-none space-y-1 font-medium leading-none"
          )}
          {...props}
        >
          <div className="text-black dark:text-white text-sm font-medium leading-none">
            {title}
          </div>
          <p
            className="
            group-hover:text-black/70
            dark:group-hover:text-white/70
            line-clamp-2
            text-sm
            leading-snug
            text-black/40
            dark:text-white/40
          "
          >
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";
