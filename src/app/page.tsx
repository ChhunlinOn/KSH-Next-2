// "use client";

import { redirect } from "next/navigation"
import { getSession } from "./action/clientauth"

export default async function HomePage() {
  // Check if user is authenticated
  const session = getSession()

  // Redirect to dashboard if authenticated, otherwise to login
  if (session) {
    redirect("/dashbaord/pages/resident") // Fixed the typo here
  } else {
    redirect("/login")
  }
  // redirect('/dashbaord/pages/resident');
}
