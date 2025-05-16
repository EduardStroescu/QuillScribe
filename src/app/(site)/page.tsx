import React from "react";
import Link from "next/link";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

import TitleSection from "@/components/landing-page/title-section";
import { CLIENTS, USERS } from "@/lib/const/constants";
import CustomCard from "@/components/landing-page/custom-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardTitle } from "@/components/ui/card";
import PricingCards from "@/components/landing-page/pricing-cards";
import { randomUUID } from "crypto";
import { Background } from "./background";
import Banner from "../../../public/appBanner.png";
import Cal from "../../../public/cal.png";

const HomePage = () => {
  return (
    <>
      <Background />
      <section
        className="overflow-hidden
      px-4
      sm:px-6
      mt-10
      sm:flex
      sm:flex-col
      gap-4
      md:justify-center
      md:items-center"
      >
        <TitleSection
          pill="✨ Your Workspace, Perfected"
          title="All-In-One Collaboration and Productivity Platform"
        />
        <div
          className="bg-white
          p-[2px]
          mt-6
          rounded-xl
          bg-gradient-to-r
          from-primary
          to-brand-primaryBlue
          sm:w-[300px]
          relative
          z-[100]
          flex justify-center items-center
        "
        >
          <Link
            href="/signup"
            className="w-full
            rounded-[10px]
            text-2xl
            px-4 py-2
            bg-[#030014] 
            text-[#f9fafb] 
            hover:bg-secondary/20 
            text-center"
          >
            Join QuillScribe Free
          </Link>
        </div>
        <div
          className="md:mt-[-90px]
          flex
          justify-center
          items-center
          relative
        "
        >
          <Image
            src={Banner}
            priority
            quality={100}
            alt="Application Banner"
            loading="eager"
            className="object-cover"
            placeholder="empty"
          />
          <div
            className="bottom-0
            top-[30%]
            bg-gradient-to-t
            from-[#030014]
            via-[#030014]/70
            to-[#030014]/10
            left-0
            right-0
            absolute
            z-10
            ml-[7.5%]
            mr-[8%]
            rounded-xl
          "
          />
        </div>
      </section>
      <section className="relative">
        <div
          className="overflow-hidden
          flex
        "
        >
          {[...Array(2)].map(() => (
            <div
              key={randomUUID()}
              className="flex
                flex-nowrap
                animate-slide
          "
            >
              {CLIENTS.map((client) => (
                <div
                  key={client.alt}
                  className=" relative
                    w-[200px]
                    m-20
                    shrink-0
                    flex
                    items-center
                  "
                >
                  <Image
                    src={client.logo}
                    alt={client.alt}
                    width={200}
                    height={200}
                    placeholder="blur"
                    className="object-contain max-w-none"
                    style={{ width: "100px" }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
      <section
        className="px-4
        sm:px-6
        flex
        justify-center
        items-center
        flex-col
        relative
      "
      >
        <div
          className="w-[30%]
          blur-[120px]
          rounded-full
          h-32
          absolute
          bg-brand-primaryPurple/50
          -z-10
          top-22
        "
        />
        <TitleSection
          title="Keep track of your meetings all in one place"
          subheading="Capture your ideas, thoughts, and meeting notes in a structured and organized manner."
          pill="Features"
        />
        <div
          className="mt-10
          max-w-[450px]
          flex
          justify-center
          items-center
          relative
          rounded-2xl
          border-8
          border-washed-purple-300 
          border-opacity-10
          overflow-clip
        "
        >
          <Image
            src={Cal}
            alt="Banner"
            placeholder="blur"
            quality={100}
            width={740}
            height={710}
          />
        </div>
      </section>
      <section className="relative">
        <div
          className="w-full
          blur-[120px]
          rounded-full
          h-32
          absolute
          bg-brand-primaryPurple/50
          -z-100
          top-56
        "
        />
        <div
          className="mt-20
          px-4
          sm:px-6 
          flex
          flex-col
          overflow-x-hidden
          overflow-visible
        "
          id="testimonials"
        >
          <TitleSection
            title="Trusted by all"
            subheading="Join thousands of satisfied users who rely on our platform for their 
            personal and professional productivity needs."
            pill="Testimonials"
          />
          {[...Array(2)].map((_, index) => (
            <div
              key={randomUUID()}
              className={twMerge(
                clsx("mt-10 flex flex-nowrap gap-6 self-start", {
                  "flex-row-reverse": index === 1,
                  "animate-[slide_250s_linear_infinite]": true,
                  "animate-[slide_250s_linear_infinite_reverse]": index === 1,
                  "ml-[100vw]": index === 1,
                }),
                "hover:paused"
              )}
            >
              {USERS.map((testimonial, index) => (
                <CustomCard
                  key={testimonial.name}
                  className="w-[500px]
                  shrink-0
                  max-w-xs
                  sm:max-w-full
                  rounded-xl
                  bg-black/60
                  text-washed-purple-800
                  border-[#282637]
                "
                  cardHeader={
                    <div
                      className="flex
                      items-center
                      gap-4
                  "
                    >
                      <Avatar>
                        <AvatarImage src={`/avatars/${index + 1}.png`} alt="" />
                        <AvatarFallback>
                          {testimonial.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-[#cac2ff]">
                          {testimonial.name}
                        </CardTitle>
                      </div>
                    </div>
                  }
                  cardContent={
                    <p className="dark:text-washed-purple-800">
                      {testimonial.message}
                    </p>
                  }
                ></CustomCard>
              ))}
            </div>
          ))}
        </div>
      </section>
      <section
        className="mt-20
        px-4
        sm:px-6
      "
        id="pricing"
      >
        <TitleSection
          title="The Perfect Plan For You"
          subheading="Experience all the benefits of our platform. Select a plan that suits your needs and take your productivity to new heights."
          pill="Pricing"
        />
        <div
          className="flex 
        flex-col-reverse
        sm:flex-row
        gap-4
        justify-center
        sm:items-stretch
        items-center
        mt-10
        pb-10
        "
        >
          <PricingCards />
        </div>
      </section>
    </>
  );
};

export default HomePage;
