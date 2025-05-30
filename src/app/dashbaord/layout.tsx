import type React from "react";
import { redirect } from "next/navigation";
import { ClientLayoutWrapper } from "../component/layout";
// import { getSession } from "../action/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check
  // const session = await getSession();
  // if (!session) redirect("/login");

  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}
