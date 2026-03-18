import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getMe } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("eduai_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("eduai_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  async function login(email, password) {
    const data = await apiLogin(email, password);
    localStorage.setItem("eduai_token", data.access_token);
    setToken(data.access_token);
    const me = await getMe();
    setUser(me);
    return me;
  }

  async function register(name, email, password, role) {
    const data = await apiRegister(email, name, password, role);
    localStorage.setItem("eduai_token", data.access_token);
    setToken(data.access_token);
    const me = await getMe();
    setUser(me);
    return me;
  }

  function logout() {
    localStorage.removeItem("eduai_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
