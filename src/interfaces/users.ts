export interface User {
    _id: string;
    name: string;
    role: 'admin' | 'user';
    email:string;
    isActive: boolean;
  }