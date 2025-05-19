export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  avatar: string;
  token: string;
}

export interface UserContextType {
  user: User | null;
  logout: () => void;
}
