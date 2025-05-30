// app/page.js
import { redirect } from "next/navigation";
import { getServerSession } from "@/app/action/auth";

export default async function HomePage() {
  const session = await getServerSession();
  if (session) {
    redirect("/dashbaord/pages/resident");
  } else {
    redirect("/login");
  }
}