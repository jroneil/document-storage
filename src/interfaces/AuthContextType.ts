import { Dispatch } from "react";
import { User } from "./users";

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    dispatch: Dispatch<{ type: string; payload?: any }>; // Add dispatch
  }