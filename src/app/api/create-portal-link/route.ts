import { stripe } from "@/lib/stripe";
import { createOrRetrieveCustomer } from "@/lib/stripe/adminTasks";
import { getStripeRedirectUrl } from "@/lib/utils";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await createOrRetrieveCustomer({
      email: user.email || "",
      uuid: user.id,
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getStripeRedirectUrl()}/dashboard`,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("ERROR creating billing portal session:", error);
    if (
      error &&
      typeof error === "object" &&
      !Array.isArray(error) &&
      "message" in error
    ) {
      return NextResponse.json(
        { error: error.message || "Internal Server Error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error || "Internal Server Error" },
      { status: 500 }
    );
  }
}
