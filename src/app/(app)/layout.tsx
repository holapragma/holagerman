import { AppShell } from "@/components/layout/app-shell";
import { cookies } from "next/headers";
import { SIDEBAR_COOKIE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const defaultCollapsed = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === "true";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppShell defaultCollapsed={defaultCollapsed} userEmail={user?.email}>
      {children}
    </AppShell>
  );
}
