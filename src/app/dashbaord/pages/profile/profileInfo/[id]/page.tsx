"use client";
import { useState, useEffect } from "react";
import { Edit, ArrowLeft, X, Eye, EyeOff } from "lucide-react"; // Add Eye, EyeOff
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSession } from "@/app/action/clientauth"; // Adjust the import path as needed

const ProfileInfoPage = () => {
  const { id } = useParams();
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const session = getSession();
  const token = session?.jwt;

  type User = {
    id: number;
    fullName: string;
    role: string;
    phone?: string;
    email: string;
    image?: string;
    location?: string;
    memberSince?: string;
    password?: string;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [formData, setFormData] = useState<User | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const fetchProfile = async () => {
    if (!api_url || !token) {
      setError("API configuration is missing");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${api_url}/users/${id}?populate=*`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      const userData: User = {
        id: data.id,
        fullName: data.username,
        email: data.email,
        phone: data.phone || "", // Adjust if phone is in a related entity
        location: data.location || "", // Adjust if location is in a related entity
        memberSince: data.createdAt,
        role: data.role?.name || "User",
        image: data?.profile_img?.url || "https://via.placeholder.com/150",
      };
      setProfile(userData);
      setFormData(userData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!api_url || !token) {
      throw new Error("API configuration is missing");
    }

    const formData = new FormData();
    formData.append("files", file);

    const response = await fetch(`${api_url}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data[0].id; // Return the ID of the uploaded image
  };

 const updateProfile = async (updatedData: User, imageId?: number) => {
  if (!api_url || !token) {
    setError("API configuration is missing");
    return;
  }

  try {
    const payload: any = {
      username: updatedData.fullName,
      email: updatedData.email,
    };

    if (updatedData.password) {
      payload.password = updatedData.password;
    }

    if (imageId) {
      payload.profile_img = imageId;
    }

    const response = await fetch(`${api_url}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to update profile");
    }

    const data = await response.json();
    const updatedUser: User = {
      id: data.id,
      fullName: data.username,
      email: data.email,
      phone: data.phone || updatedData.phone || "",
      location: data.location || updatedData.location || "",
      memberSince: data.createdAt,
      role: data.role?.name || "User",
      image: data?.profile_img?.url || updatedData.image || "https://via.placeholder.com/150",
    };

    setProfile(updatedUser);
    setFormData(updatedUser);
    setIsModalOpen(false);
    setError(null);

    // Show success alert
    alert("Profile updated successfully!");
  } catch (error: any) {
    console.error("Error updating profile:", error);
    setError(error.message || "Failed to update profile. Please try again.");
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      let imageId: number | undefined;
      if (imageFile) {
        imageId = await uploadImage(imageFile);
      }
      await updateProfile(formData, imageId);
      setImageFile(null); // Clear the image file after successful upload
    } catch (error: any) {
      setError(error.message || "Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  function formatDate(dateString?: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error || "Profile not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 relative">
      <div className="absolute top-8 left-8 z-20">
        <Link href="/dashbaord/pages/profile">
          <button className="bg-gray-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-400 transition duration-300">
            Back
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-7xl overflow-hidden z-10 border border-gray-100">
        <div className="flex flex-col lg:flex-row min-h-[700px] lg:min-h-[800px]">
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 text-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-60 xl:h-60 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-green-600 opacity-20 blur-xl"></div>
              <img
                src={profile.image || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white relative z-10"
              />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mt-6 sm:mt-8 lg:mt-10">
              {profile.fullName}
            </h2>
            <div className="mt-4 bg-white/50 px-6 py-2 rounded-full shadow-sm border border-green-100 backdrop-blur-sm">
              <span className="text-green-800 text-sm">{profile.role}</span>
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-8 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-12">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-16 md:gap-y-28 gap-x-6 sm:gap-x-8 mb-10">
                <div className="group">
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-2 group-hover:text-green-600 transition-colors">
                    Email
                  </p>
                  <p className="text-base sm:text-lg md:text-xl font-medium text-gray-800 break-words border-b border-gray-100 pb-1 group-hover:border-green-200 transition-colors">
                    {profile.email}
                  </p>
                </div>
                <div className="group">
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-2 group-hover:text-green-600 transition-colors">
                    Member Since
                  </p>
                  <p className="text-base sm:text-lg md:text-xl font-medium text-gray-800 border-b border-gray-100 pb-1 group-hover:border-green-200 transition-colors">
                    {formatDate(profile.memberSince)}
                  </p>
                </div>
                <div className="group">
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-2 group-hover:text-green-600 transition-colors">
                    Phone
                  </p>
                  <p className="text-base sm:text-lg md:text-xl font-medium text-gray-800 break-words border-b border-gray-100 pb-1 group-hover:border-green-200 transition-colors">
                    {profile.phone || "Not provided"}
                  </p>
                </div>
                <div className="group">
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-2 group-hover:text-green-600 transition-colors">
                    Location
                  </p>
                  <p className="text-base sm:text-lg md:text-xl font-medium text-gray-800 break-words border-b border-gray-100 pb-1 group-hover:border-green-200 transition-colors">
                    {profile.location || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-row justify-end gap-4 mt-2">
              <button
                onClick={() => {
                  setFormData(profile);
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && formData && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div
            className="bg-white px-6 py-6 sm:px-8 sm:py-8 rounded-2xl w-full max-w-md lg:max-w-lg shadow-2xl relative border border-gray-100 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">Edit Profile</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="group">
                <label className="block text-sm font-medium mb-1.5 text-gray-700 group-hover:text-green-600 transition-colors">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium mb-1.5 text-gray-700 group-hover:text-green-600 transition-colors">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="group relative">
                <label className="block text-sm font-medium mb-1.5 text-gray-700 group-hover:text-green-600 transition-colors">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"} // Toggle between text and password
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="group">
                <label className="block text-sm font-medium mb-1.5 text-gray-700 group-hover:text-green-600 transition-colors">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex flex-row justify-between gap-4 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-base transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-base shadow-md hover:shadow-lg transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfoPage;