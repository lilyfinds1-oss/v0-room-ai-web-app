'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Payment {
  id: string
  user_id: string
  amount: number
  status: string
  created_at: string
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/admin/payments')
        if (response.ok) {
          const data = await response.json()
          setPayments(data.payments || [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments Management</h1>
        <p className="text-muted-foreground">Track and manage subscriptions and payments</p>
      </div>

      {/* Revenue Card */}
      <div className="p-6 rounded-lg border border-border bg-card space-y-2">
        <p className="text-sm text-muted-foreground">Total Revenue</p>
        <p className="text-4xl font-bold">${(totalRevenue / 100).toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">{payments.length} transactions</p>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                    {payment.user_id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">
                    ${(payment.amount / 100).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'completed'
                          ? 'bg-green-500/20 text-green-500'
                          : payment.status === 'failed'
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-blue-500/20 text-blue-500'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                    {payment.status === 'completed' && (
                      <Button size="sm" variant="outline" className="text-orange-500">
                        Refund
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {payments.length === 0 && !loading && (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">No payments found</p>
        </div>
      )}
    </div>
  )
}
