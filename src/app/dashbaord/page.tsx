// app/dashboard/page.js
import { getServerSession } from "@/app/action/auth";
import { redirect } from "next/navigation";
import ResidentList from "./pages/resident/page";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  return <ResidentList />;
}