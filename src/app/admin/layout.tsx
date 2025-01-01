// AdminLayout.tsx
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function getUser() {
  const headersList = headers();
  const token = (await headersList).get('cookie')?.split('token=')[1]?.split(';')[0];

  if (!token) {
    redirect('/login');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error('Error response:', await response.text());
      redirect('/login');
    }

    if (response.headers.get('Content-Type')?.includes('application/json')) {
      return await response.json();
    } else {
      console.error('Non-JSON response:', await response.text());
      redirect('/login');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    redirect('/login');
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user) {
    return <div>Loading...</div>; // Or a better loading component
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... your layout JSX using user data */}
        <span className="text-gray-700">Welcome, {user.name}</span>
      {/* ... */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}