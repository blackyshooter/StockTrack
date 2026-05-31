import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("stocktrack_user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoadingAuth(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("stocktrack_token", token);
    localStorage.setItem("stocktrack_user", JSON.stringify(user));

    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem("stocktrack_token");
    localStorage.removeItem("stocktrack_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loadingAuth,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);