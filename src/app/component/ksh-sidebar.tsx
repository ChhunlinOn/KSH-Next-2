"use client"

import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { User, LogOut, Settings, HelpCircle } from 'lucide-react'
import { logout } from "../action/clientauth"
import { useRouter, usePathname } from "next/navigation"
import path from "path"

export function KshSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  // Main navigation items with image icons
  const mainNavItems = [
    {
      name: "Residents",
      imageSrc: "/resident_5e1d62f6a2.png",
      path: "/dashbaord/pages/resident",
      active: isActive("/dashbaord/pages/resident"),
    },
    {
      name: "Medical",
      imageSrc: "/heartmedical.png",
      path: "/dashbaord/pages/medical",
      active: isActive("/dashbaord/pages/medical"),
    },
    {
      name: "Programs",
      imageSrc: "/activities.png",
      path: "/dashbaord/pages/program",
      active: isActive("/dashbaord/pages/program"),
    },
    {
      name: "Assessment",
      imageSrc: "/list2.png",
      path: "/dashbaord/pages/assessment",
      active: isActive("/dashbaord/pages/assessment"),
    },
    {
      name: "salary",
      imageSrc: "/money.png",
      path: "/dashbaord/pages/salary",
      active: isActive("/dashbaord/pages/salary"),
    },
    {
      name: "Staff",
      imageSrc: "/staff.png",
      path: "/dashbaord/pages/profile",
      active: isActive("/dashbaord/pages/profile"),
    }
  ]

  const handleSignOut = () => {
     logout()
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return (
    // Hide sidebar on mobile with the hidden md:block classes
    <div className="hidden md:block">
      <Sidebar className="border-r border-[#e8e0cc] w-80 bg-[#f5f0e0]" collapsible="none">
        <SidebarHeader className="border-b border-[#e8e0cc] py-4 bg-[#f5f0e0]">
          <div className="px-6">
            <h2 className="text-2xl font-bold text-green-700">KSH Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Resident Management System</p>
          </div>
        </SidebarHeader>

        <SidebarContent className="overflow-y-auto bg-[#f5f0e0]">
          {/* Main Navigation */}
          <div className="px-4 py-3">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2 mb-4">Main Navigation</h3>
            <SidebarMenu className="space-y-3">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    isActive={item.active}
                    onClick={() => navigateTo(item.path)}
                    className={`group py-6 h-20 px-6 flex items-center transition-all duration-200 shadow-sm ${
                      item.active
                        ? "!bg-green-700 !text-white"
                        : "hover:bg-[#f5f1e4] text-gray-700 hover:text-green-800"
                    }`}
                  >
                    <div className="w-20 h-13 mr-6 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Image
                        src={item.imageSrc || "/placeholder.svg"}
                        alt={`${item.name} icon`}
                        width={80}
                        height={80}
                        className="object-fit"
                      />
                    </div>
                    <span className="text-xl font-semibold truncate">
                    {item.name}
                  </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
          {/* Other sections are commented out as per the provided file */}
        </SidebarContent>

        <SidebarFooter className="border-t border-[#e8e0cc] py-4 bg-[#f5f0e0]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/profile")}
                isActive={isActive("/dashboard/profile")}
                className={`py-3 px-4 ${isActive("/dashboard/profile")
                    ? "bg-[#e8e0cc] text-green-800"
                    : "hover:bg-[#ebe3d1] text-gray-700 hover:text-green-800"
                  }`}
              >
                <User className="h-5 w-5 mr-3" />
                <span className="text-base">Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/settings")}
                isActive={isActive("/dashboard/settings")}
                className={`py-3 px-4 ${isActive("/dashboard/settings")
                    ? "bg-[#e8e0cc] text-green-800"
                    : "hover:bg-[#ebe3d1] text-gray-700 hover:text-green-800"
                  }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                <span className="text-base">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem> */}

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/help")}
                isActive={isActive("/dashboard/help")}
                className={`py-3 px-4 ${isActive("/dashboard/help")
                    ? "bg-[#e8e0cc] text-green-800"
                    : "hover:bg-[#ebe3d1] text-gray-700 hover:text-green-800"
                  }`}
              >
                <HelpCircle className="h-5 w-5 mr-3" />
                <span className="text-base">Help & Support</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarSeparator className="my-3 bg-[#e8e0cc]" />

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 hover:bg-[#ebe3d1] py-3 px-4"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="text-base">Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}
