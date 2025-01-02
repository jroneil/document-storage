import { revalidatePath } from 'next/cache';
import { User } from '@/interfaces/users';
export async function getUsers(token: string | null): Promise<User[]> {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log("backendUrl"+backendUrl)
 
    try {
      const res = await fetch(`${backendUrl}/users`,{
        cache: 'no-store' ,// Important for dynamic data
        headers: {
          Authorization: token ? `Bearer ${token}` : '', // Add Authorization header
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      const data = await res.json();
      return data.data as User[];
    } catch (error) {
      console.error("Error fetching users:", error);
      return []; // Return an empty array in case of error
    }
  }

  export async function deleteUsers(token: string | null): Promise<User[]> {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log("backendUrl"+backendUrl)
 
    try {
      const res = await fetch(`${backendUrl}/users`,{
        cache: 'no-store' ,// Important for dynamic data
        headers: {
          Authorization: token ? `Bearer ${token}` : '', // Add Authorization header
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      const data = await res.json();
      return data.data as User[];
    } catch (error) {
      console.error("Error fetching users:", error);
      return []; // Return an empty array in case of error
    }
  }
  
  async function updateUser(id: string, updates: Partial<User>) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(updates),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
  
      const data = await response.json();
      //revalidatePath(`/users/${id}`)
      return data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  export async function deleteUser(id: string) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
          method: 'DELETE',
          headers:{
              Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete user');
        }
    
        const data = await response.json();
        //revalidatePath(`/users`)
        return data;
      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    }
  // app/users/page.tsx (or any appropriate page in your app directory)


export async function createUser(userData: Omit<User, '_id'>) { // Omit _id as it's generated on the server
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }

    const data = await response.json();
    //revalidatePath("/users")
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

