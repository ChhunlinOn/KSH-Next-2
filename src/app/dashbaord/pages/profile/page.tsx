"use client"
import { FaUser, FaArrowRight } from "react-icons/fa"
import Link from "next/link"
import { useState,useEffect } from "react"
import dotenv from "dotenv"
import { getSession } from "@/app/action/clientauth"

const UserListPage = () => {
  dotenv.config();
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const session = getSession();
  const token = session?.jwt;
  type User = {
  id: number;
  fullName: string;
  role: string;
  email: string;
  image?: string;
};


const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${api_url}/users?populate=*`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      const formattedData = data.map((user: any) => ({
        id: user.id,
        fullName: user.username || "No Name",
        email: user.email || "No Email",
        role: user.role.name || "No Role",
        image: user.profile_img?.url || "/placeholder.svg",
      }));
      setUsers(formattedData);
      console.log("Fetched users:", data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 py-6 sm:py-8 md:py-10 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-center text-green-800 mb-4 sm:mb-6 md:mb-8 drop-shadow-md">
          Staff
        </h1>

        {/* Adjusted grid layout for iPad (md) and Nest Hub (xl) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-3xl shadow-lg p-4 sm:p-5 md:p-6 flex flex-col items-center text-center border-green-100 border-2 bg-white transition-transform hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 relative">
                <img
                  src={user.image || "/placeholder.svg"}
                  alt={""}
                  className="w-full h-full rounded-full object-cover border-4 border-green-700 shadow"
                  loading="lazy"
                />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mt-3 sm:mt-4">
                {user.fullName || " "}
              </h2>
              <p className="text-green-600 font-medium text-sm sm:text-base">{user.role}</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 break-words max-w-full">{user.email}</p>
              <Link href={`/dashbaord/pages/profile/profileInfo/${user.id}`} className="mt-4 sm:mt-5 md:mt-6">
                <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-700 hover:bg-green-800 text-white text-xs sm:text-sm rounded-xl transition">
                  <FaUser className="text-xs sm:text-sm" />
                  View Profile
                  <FaArrowRight className="ml-1 text-xs sm:text-sm" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserListPage
