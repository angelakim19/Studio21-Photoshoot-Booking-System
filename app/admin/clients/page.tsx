"use client"

import { clients } from "../../../lib/admin-data"

export default function ClientsPage() {
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
              <th>Bookings</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{client.name}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
                <td>{client.bookings}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}