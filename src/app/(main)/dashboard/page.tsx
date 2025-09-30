import { redirect } from "next/navigation";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import {
  getOriginalWorkspace,
  getUserSubscriptionStatus,
} from "@/lib/supabase/queries";

const DashboardPage = async () => {
  const workspace = await getOriginalWorkspace();

  if (!workspace) {
    const { data: subscriptionData, error: subscriptionError } =
      await getUserSubscriptionStatus();
    if (!subscriptionData || subscriptionError) redirect("/login");

    return (
      <div className="bg-background h-[100dvh] w-[100dvw] flex justify-center items-center">
        <DashboardSetup subscription={subscriptionData} />
      </div>
    );
  }

  redirect(`/dashboard/${workspace.id}`);
};

export default DashboardPage;
