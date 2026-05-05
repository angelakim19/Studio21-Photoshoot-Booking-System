// app/admin/clients/page.tsx

import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default async function ClientsPage() {
  const { data: clients, error } = await supabase
    .from("users")
    .select("*")

  if (error) {
    return <div className="p-6">Failed to load clients</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Clients</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="p-4">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {clients?.map((client: any) => (
              <tr key={client.id} className="border-t hover:bg-gray-50">
                
                <td className="p-4 font-medium">
                  {client.first_name} {client.last_name}
                </td>

                <td>{client.email}</td>
                <td>{client.phone}</td>

                <td className="p-4">
                  <Link
                    href={`/admin/clients/${client.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}