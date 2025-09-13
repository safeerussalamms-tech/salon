'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/TopBar'
import { BookingListItem } from '@/components/BookingListItem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
 

interface BarberPageProps {
  params: Promise<{
    id: string
  }>
}

export default function BarberPage({ params }: BarberPageProps) {
  const [activeTab, setActiveTab] = useState<'confirmed' | 'cancelled'>('confirmed')
  const [id, setId] = useState<string>('')
  
  useEffect(() => {
    params.then(({ id: paramId }) => setId(paramId))
  }, [params])
  
  const shopId = process.env.NEXT_PUBLIC_SHOP_ID || 'QS001'

  type ShopSummaryResponse = {
    success: boolean
    data: {
      settings: { shop_id: string; shop_name: string }
      barbers: Array<{ _id: string; barber_id: string; name: string; active: boolean }>
    }
  }

  const { data: shopSummary } = useQuery<ShopSummaryResponse>({
    queryKey: ['shop-summary', shopId],
    queryFn: async () => {
      const res = await fetch(`https://quick-barber.vercel.app/api/admin/shop-summary?shop_id=${shopId}`)
      if (!res.ok) throw new Error('Failed to load shop summary')
      return res.json()
    },
    staleTime: 60_000,
  })

  type BookingsResponse = {
    success: boolean
    data: Array<{
      _id: string
      booking_id: string
      date: string
      start_time: string
      end_time: string
      service_key: string
      customer_phone: string
      barber_id: string
      status: string
      customer_name: string | null
    }>
  }

  const { data: bookingsRes, isLoading } = useQuery<BookingsResponse>({
    queryKey: ['bookings', shopId, id, activeTab],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
      const statusParam = activeTab === 'cancelled' ? '&status=cancelled' : ''
      const res = await fetch(`https://quick-barber.vercel.app/api/admin/bookings?shop_id=${shopId}&barber_id=${id}&date=${today}${statusParam}`, {
        next: { revalidate: 0 },
      })
      if (!res.ok) throw new Error('Failed to load bookings')
      return res.json()
    },
    staleTime: 30_000,
  })

  const displayName = shopSummary?.data?.barbers?.find(b => b.barber_id === id)?.name 
    || id

  // Calculate salon working status based on API data
  const isSalonWorking = shopSummary?.data?.barbers?.some(b => b.active) || false

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <TopBar 
        title={displayName} 
        isWorking={isSalonWorking} 
        showBack={true}
        icon="user"
      />
      
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Bookings</CardTitle>
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-16">
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'confirmed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'cancelled'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Cancelled
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(n => (
                  <div key={n} className="flex items-start gap-4 py-3 border-b last:border-b-0 animate-pulse">
                    <div className="flex flex-col items-center min-w-[40px]">
                      <div className="w-0.5 h-full bg-gray-200"></div>
                      <div className="h-3 w-6 bg-gray-200 rounded mt-1"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-40 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-28 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (bookingsRes?.data?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {activeTab === 'confirmed' ? 'No confirmed bookings for today' : 'No cancelled bookings for today'}
              </div>
            ) : (
              <div className="space-y-0">
                {bookingsRes!.data.map((b, index) => {
                  const start = new Date()
                  const [sh, sm] = b.start_time.split(':').map(Number)
                  start.setHours(sh, sm, 0, 0)
                  const end = new Date()
                  const [eh, em] = b.end_time.split(':').map(Number)
                  end.setHours(eh, em, 0, 0)
                  return (
                    <BookingListItem
                      key={b._id}
                      booking={{
                        id: b.booking_id,
                        customerName: b.customer_name || b.customer_phone,
                        service: b.service_key as 'cutting' | 'shaving' | 'both',
                        start: start.toISOString(),
                        end: end.toISOString(),
                        barberId: b.barber_id,
                        status: b.status as 'booked' | 'notified' | 'cancelled',
                      }}
                      index={index}
                    />
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
