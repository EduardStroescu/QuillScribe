"use client";

import React from "react";
import CustomCard from "./custom-card";
import { PRICING_CARDS, PRICING_PLANS } from "@/lib/constants";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Diamond from "../../../public/icons/diamond.svg";
import CheckIcon from "../../../public/icons/check.svg";
import { CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";

const PricingCards = () => {
  const { open, setOpen } = useSubscriptionModal();
  const router = useRouter();

  return (
    <>
      {PRICING_CARDS.map((card) => (
        <CustomCard
          key={card.planType}
          className={clsx(
            "w-[300px] rounded-2xl dark:bg-black/40 background-blur-3xl relative",
            {
              "border-brand-primaryPurple/70":
                card.planType === PRICING_PLANS.proplan,
            }
          )}
          cardHeader={
            <CardTitle
              className="text-2xl
                  font-semibold
              "
            >
              {card.planType === PRICING_PLANS.proplan && (
                <>
                  <div
                    className="hidden dark:block w-full blur-[120px] rounded-full h-32
                        absolute
                        bg-brand-primaryPurple/80
                        -z-10
                        top-0
                      "
                  />
                  <Image
                    src={Diamond}
                    alt="Pro Plan Icon"
                    className="absolute top-6 right-6"
                  />
                </>
              )}
              {card.planType}
            </CardTitle>
          }
          cardContent={
            <CardContent className="p-0">
              <span
                className="font-normal 
                    text-2xl
                "
              >
                ${card.price}
              </span>
              {+card.price > 0 ? (
                <span className="dark:text-washed-purple-800 ml-1">/mo</span>
              ) : (
                ""
              )}
              <p className="dark:text-washed-purple-800">{card.description}</p>
              <Button
                variant="btn-primary"
                className="whitespace-nowrap w-full mt-4 mb-4"
                onClick={() =>
                  card.planType === PRICING_PLANS.proplan
                    ? setOpen(true)
                    : router.push("/signup")
                }
              >
                {card.planType === PRICING_PLANS.proplan
                  ? "Go Pro"
                  : "Get Started"}
              </Button>
              <small>{card.highlightFeature}</small>
            </CardContent>
          }
          cardFooter={
            <ul
              className="font-normal
                  flex
                  mb-2
                  flex-col
                  gap-4
                "
            >
              {card.freatures.map((feature) => (
                <li
                  key={feature}
                  className="flex
                      items-center
                      gap-2
                    "
                >
                  <Image src={CheckIcon} alt="Check Icon" />
                  {feature}
                </li>
              ))}
            </ul>
          }
        />
      ))}
    </>
  );
};

export default PricingCards;
