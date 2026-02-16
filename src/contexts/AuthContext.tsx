import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/lib/api";
import type { User, LoginActivity } from "@/lib/types";
import { AxiosError } from "axios";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loginActivities: LoginActivity[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data as any;
      console.log(response.data, "response");
      console.log(userData, "userdata");
      setUser({
        id: userData.id as string,
        username: userData.username as string,
        password: "", // Not needed from backend
        role: userData.role as "admin" | "staff",
        createdAt: userData.created_at as string,
      });
      setIsAuthenticated(true);

      // Load login activities
      try {
        const activitiesResponse = await authAPI.getLoginActivities();
        const activities = (activitiesResponse.data.data || []) as Record<string, unknown>[];
        setLoginActivities(
          activities.map((activity) => ({
            id: activity.id as string,
            userId: activity.user_id as string,
            timestamp: activity.login_time as string,
            ip: (activity.ip_address as string) || "Unknown",
            device: (activity.user_agent as string) || "Unknown",
            success: activity.success as boolean,
          })),
        );
      } catch (error) {
        console.error("Failed to load login activities:", error);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      const { user, token } = response.data;

      localStorage.setItem("token", token);

      setUser({
        id: user.id,
        username: user.username,
        password: "",
        role: user.role as "admin" | "staff",
        createdAt: new Date().toISOString(),
      });

      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return { success: false, message: "Invalid credentials" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setLoginActivities([]);
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loginActivities,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
