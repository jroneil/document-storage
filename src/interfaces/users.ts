export type UserRole = "user" | "admin";

export interface User {
    password: string;
    _id?: string;
    name: string;
    role: UserRole;
    email:string;
    isActive: boolean;
  }