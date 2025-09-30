"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";

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
import { LinkButton } from "../ui/link-button";

const Header = () => {
  return (
    <header className="p-4 flex justify-between items-center">
      <Link
        href={"/"}
        className="min-w-fit w-fit flex gap-2
        justify-left items-center rounded ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Image
          src={Logo}
          alt="QuillScribe Logo"
          priority
          width={100}
          height={100}
          style={{ width: "100px", height: "100px" }}
        />
        <span className="font-semibold text-white">QuillScribe.</span>
      </Link>
      <NavigationMenu className="hidden md:block">
        <NavigationMenuList className="gap-6">
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                "text-white dark:hover:text-white dark:text-white/40 font-normal text-xl"
              )}
            >
              Pricing
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:grid-row-2">
                <ListItem title="Pro Plan" href="#pricing">
                  Unlock the full power of collaboration.
                </ListItem>
                <ListItem title="Free Plan" href="#pricing">
                  Great for teams just starting out.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="#testimonials"
              className={cn(
                navigationMenuTriggerStyle(),
                "text-white dark:hover:text-white dark:text-white/40 font-normal text-xl"
              )}
            >
              Testimonials
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <aside className="flex gap-2 justify-end">
        <LinkButton href={"/login"} variant="btn-primary">
          Login
        </LinkButton>
        <LinkButton
          href="/signup"
          variant="secondary"
          className="hidden sm:flex whitespace-nowrap"
        >
          Sign Up
        </LinkButton>
      </aside>
    </header>
  );
};

export default Header;

const ListItem = forwardRef<ElementRef<"a">, ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
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
            <p className=" group-hover:text-black/70 dark:group-hover:text-white/70 line-clamp-2 text-sm leading-snug text-black/40 dark:text-white/40">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);

ListItem.displayName = "ListItem";
