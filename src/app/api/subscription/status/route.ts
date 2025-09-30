import { getUserSubscriptionStatus } from "@/lib/supabase/queries";
import { NextResponse } from "next/server";

export async function GET() {
  const subscription = await getUserSubscriptionStatus();

  if (subscription.error) {
    return NextResponse.json({ error: subscription.error }, { status: 500 });
  }

  return NextResponse.json(subscription.data, { status: 200 });
}
