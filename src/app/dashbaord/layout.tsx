"use client";
import type React from "react";
import { redirect } from "next/navigation";
import { ClientLayoutWrapper } from "../component/layout";
import { getSession } from "../action/clientauth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check
  const session = getSession();
  if (!session) redirect("/login");

  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}
