import Cookies from 'js-cookie';

type LoginResponse = {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    role: string | null;
    profileImage: string | null;
  };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type");
    const result = contentType?.includes("application/json") ? await response.json() : null;

    if (!response.ok || !result?.success || !result.token || !result.user) {
      const errorMsg = result?.error || "Login failed";
      return { success: false, error: errorMsg };
    }

    const token = result.token;
    const userId = result.user.id.toString();
    const roleName = result.user.role || null;

    // Save JWT securely in cookies
    Cookies.set("jwt", token, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    Cookies.set("userId", userId);
    if (roleName) Cookies.set("userRole", roleName);

    return {
      success: true,
      user: {
        id: userId,
        role: roleName,
        profileImage: null, // not returned in the new response
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
type Session = {
  jwt: string | null;
  userRole: string | null;
  userImage: string | null;
  userId: string | null;
} | null;


export function getSession() : Session{
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