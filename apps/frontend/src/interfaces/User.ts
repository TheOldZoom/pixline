export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "USER" | "ADMIN";
  token: string;
  createdAt: string;
  updatedAt: string;
}
export interface UserContextType {
  user: User | null;
  logout: () => void;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
}
