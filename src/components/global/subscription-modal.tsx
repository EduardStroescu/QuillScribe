"use client";

import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";
import { type FC, Fragment, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { formatPrice, createStripePortalLink } from "@/lib/utils";
import { Button } from "../ui/button";
import Loader from "./loader";
import { Price, ProductWithPrice } from "@/lib/supabase/supabase.types";
import { toast } from "../ui/use-toast";
import { getStripe } from "@/lib/stripe/stripeClient";
import { useRouter } from "next/navigation";

interface SubscriptionModalProps {
  products: ProductWithPrice[];
}

const SubscriptionModal: FC<SubscriptionModalProps> = ({ products }) => {
  const { open, setOpen } = useSubscriptionModal();
  const router = useRouter();
  const { subscription } = useSupabaseUser();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSupabaseUser();

  const onClickContinue = async (price: Price) => {
    setIsLoading(true);
    try {
      if (!user) {
        toast({ title: "You must be logged in" });
        setIsLoading(false);
        router.push("/login");
        return;
      }
      if (subscription) {
        toast({ title: "Already on a paid plan" });
        setIsLoading(false);
        return;
      }
      const { sessionId } = await createStripePortalLink({
        url: "/api/create-checkout-session",
        data: { price },
      });

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {subscription?.status === "active" ? (
        <DialogContent>Already on Pro Plan!</DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Pro Plan</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            To access Pro features you need to have a paid plan.
          </DialogDescription>
          {products.length
            ? products.map((product) => (
                <div
                  className="
                  flex
                  justify-between
                  items-center
                  "
                  key={product.id}
                >
                  {product?.prices?.map((price) => (
                    <Fragment key={price.id}>
                      <b className="text-3xl text-foreground">
                        {formatPrice(price)} / <small>{price.interval}</small>
                      </b>
                      <Button
                        onClick={() => onClickContinue(price)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader /> : "Upgrade ✨"}
                      </Button>
                    </Fragment>
                  ))}
                </div>
              ))
            : ""}
          {/* No Products Available */}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SubscriptionModal;
