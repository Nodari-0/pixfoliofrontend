import { createContext, useState, useEffect } from "react";
import { verify } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authenticateUser = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const response = await verify();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error verifying token:", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authenticateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
