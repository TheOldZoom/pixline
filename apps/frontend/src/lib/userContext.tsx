import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as jwt from "jsonwebtoken";
import { useRouter } from "next/router";
import { User, UserContextType } from "@/interfaces/User";

const UserContext = createContext<UserContextType>({
  user: null,
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt.decode(token) as User;
        if (!decoded) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          const UserWithToken = {
            ...decoded,
            token,
          };
          setUser(UserWithToken);
        }
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  }, [router]);
  return (
    <UserContext.Provider value={{ user, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
