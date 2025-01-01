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
  
 