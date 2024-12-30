import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for document management system',
}

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href="/admin/dashboard/documents" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Documents</h2>
          <p className="text-gray-600">Manage all documents in the system</p>
        </Link>

        <Link 
          href="/admin/dashboard/users" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </Link>

        <Link 
          href="/admin/dashboard/metadata" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Metadata Fields</h2>
          <p className="text-gray-600">Configure document metadata fields</p>
        </Link>
      </div>
    </div>
  )
}
