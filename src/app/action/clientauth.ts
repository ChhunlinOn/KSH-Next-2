"use client";

type LoginResponse = {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    role: string | null;
    profileImage: string | null;
  };
};

type Session = {
  jwt: string | null;
  userRole: string | null;
  userImage: string | null;
  userId: string | null;
} | null;

export async function login(email: string, password: string): Promise<LoginResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("API URL not defined");
    return { success: false, error: "API URL not configured" };
  }

  try {
    const loginData = {
      identifier: email,
      password: password,
    };

    const response = await fetch(`${apiUrl}/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
      cache: "no-store",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error?.message || "Login failed",
      };
    }

    const jwt = result.jwt;
    const userId = result.user.id;

    const userResponse = await fetch(`${apiUrl}/users/${userId}?populate=role,profile_img`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      cache: "no-store",
      credentials: "include",
    });

    const userResult = await userResponse.json();

    if (!userResponse.ok) {
      return {
        success: false,
        error: userResult.error?.message || "Failed to fetch user details",
      };
    }

    const roleName = userResult.role?.name;
    const profileImage = userResult.profile_img?.formats?.thumbnail?.url || null;

    // Store in localStorage only if in browser
    if (typeof window !== "undefined") {
      localStorage.setItem("jwt", jwt);
      localStorage.setItem("userRole", roleName || "");
      localStorage.setItem("userId", userId.toString());
      if (profileImage) {
        localStorage.setItem("userImage", profileImage);
      }
    }

    // Set cookies for server-side access
    // await fetch("/api/session", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     jwt,
    //     userRole: roleName || "",
    //     userImage: profileImage || "",
    //     userId,
    //   }),
    // });

    console.log("Client session set:", {
      jwt: typeof window !== "undefined" ? localStorage.getItem("jwt") : null,
      userRole: typeof window !== "undefined" ? localStorage.getItem("userRole") : null,
      userImage: typeof window !== "undefined" ? localStorage.getItem("userImage") : null,
      userId: typeof window !== "undefined" ? localStorage.getItem("userId") : null,
    });

    return {
      success: true,
      user: {
        id: userId,
        role: roleName,
        profileImage,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userImage");
    localStorage.removeItem("userId");
  }

  // fetch("/api/session", { method: "DELETE" });

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function getSession(): Session {
  if (typeof window === "undefined") {
    return null;
  }

  const jwt = localStorage.getItem("jwt");
  const userRole = localStorage.getItem("userRole");
  const userImage = localStorage.getItem("userImage");
  const userId = localStorage.getItem("userId");

  if (!jwt) {
    return null;
  }

  return {
    jwt,
    userRole,
    userImage,
    userId,
  };
}