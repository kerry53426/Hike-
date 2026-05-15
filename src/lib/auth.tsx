import React, { createContext, useContext, useEffect, useState } from "react";

export interface AppUser {
  uid: string;
  name: string;
  phone?: string;
  role: "employee" | "driver" | "admin";
}

interface AuthContextType {
  user: AppUser | null;
  appUser: AppUser | null;
  loading: boolean;
  login: (name: string, role: string) => void;
  updatePhone: (phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true,
  login: () => {},
  updatePhone: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("sheipa_user");
    if (storedUser) {
      try {
        setAppUser(JSON.parse(storedUser));
      } catch(e) {}
    }
    setLoading(false);
  }, []);

  const login = (name: string, role: string) => {
    let savedPhone;
    try {
      const phones = JSON.parse(localStorage.getItem("sheipa_saved_phones") || "{}");
      savedPhone = phones[name];
    } catch(e) {}

    const newUser: AppUser = {
      uid: name, // use name as simple uid
      name,
      role: role as "employee" | "driver" | "admin",
      ...(savedPhone && { phone: savedPhone })
    };
    localStorage.setItem("sheipa_user", JSON.stringify(newUser));
    setAppUser(newUser);
  };

  const updatePhone = (phone: string) => {
    if (appUser) {
      const updatedUser = { ...appUser, phone };
      localStorage.setItem("sheipa_user", JSON.stringify(updatedUser));
      
      try {
        const phones = JSON.parse(localStorage.getItem("sheipa_saved_phones") || "{}");
        phones[appUser.name] = phone;
        localStorage.setItem("sheipa_saved_phones", JSON.stringify(phones));
      } catch (e) {}

      setAppUser(updatedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem("sheipa_user");
    setAppUser(null);
  };

  return (
    <AuthContext.Provider value={{ user: appUser, appUser, loading, login, updatePhone, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
