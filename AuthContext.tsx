import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  user: any;
  token: string | null;
  isLoading: boolean;
  login: (userData: any, authToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");
        if (storedUser && storedToken) {
          console.log("Retrieved token:", storedToken); // Log the retrieved token
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (userData: any, authToken: string) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("token", authToken);
      console.log("Saved token:", authToken); // Log the saved token
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error("Login error", error);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
