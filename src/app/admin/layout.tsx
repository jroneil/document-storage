import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

async function getUser() {
  const headersList = headers()
  const token = (await headersList).get('cookie')?.split('token=')[1]?.split(';')[0]
  console.log("token === " + token)

  if (!token) {
    redirect('/login')
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Log the raw response for debugging
    console.log('Response Status:', response.status)
    const contentType = response.headers.get('Content-Type') || ''
    console.log('Content-Type:', contentType)

    // Check if the response is JSON
    if (!response.ok) {
      console.error('Error response:', await response.text())
      redirect('/login')
    }

    if (contentType.includes('application/json')) {
      // If the response is JSON, parse it
      return await response.json()
    } else {
      // Handle non-JSON response (e.g., HTML error page)
      console.error('Non-JSON response received:', await response.text())
      redirect('/login')
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    redirect('/login')
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">Document Storage</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700">Welcome, {user.name}</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
