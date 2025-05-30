
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import { getSession } from "./action/clientauth";
import { redirect } from "next/navigation";

// Load the Inter font once at the root level
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: 'KSH Dashboard',
  description: 'The official Next.js Course Dashboard, built with App Router.',
  icons: {
    icon: 'https://res.cloudinary.com/dq5usncvp/image/upload/v1727160393/photo_2024_09_24_13_43_19_74e3099b67.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check if user is authenticated
  // const session = getSession();
  // // If not authenticated, redirect to login
  // if (!session) {
  //   redirect("/login");
  // }
    
  return (
    <html lang="en" className={inter.className}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
