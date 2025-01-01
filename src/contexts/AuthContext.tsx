'use client';

import { createContext, useContext, useState, useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/interfaces/users'; 


// Interface for AuthContext value
interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null; // Add token property
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      console.log('######'+action.payload.token)
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

interface AuthContextType { // Removed dispatch
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, dispatch] = useReducer(authReducer, { user: null, token: null, loading: true }); // dispatch is here
  const { user, token, loading } = authState;

  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const response = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.data, token: storedToken } });
          } else {
            localStorage.removeItem("token");
            dispatch({ type: 'LOGOUT' });
          }
        }
      } catch (error) { console.error('Error checking auth:', error); }
      finally { dispatch({ type: "SET_LOADING", payload: false }); }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      const data = await response.json();
      localStorage.setItem("token", data.data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.data.user, token: data.data.token } });
      router.push('/admin/dashboard');
    } catch (error) { console.error('Login error:', error); throw error; }
    finally { dispatch({ type: "SET_LOADING", payload: false }); }
  };

  const register = async (name: string, email: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      const data = await response.json();
      localStorage.setItem("token", data.data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.data.user, token: data.data.token } });
      router.push('/admin/dashboard');
    } catch (error) { console.error('Register error:', error); throw error; }
    finally { dispatch({ type: "SET_LOADING", payload: false }); }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem("token");
      dispatch({ type: 'LOGOUT' });
      router.push('/login');
    } catch (error) { console.error('Logout error:', error); }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout }}> {/* dispatch removed here */}
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) { throw new Error('useAuth must be used within an AuthProvider'); }
  return context;
}
