'use client'

import { TopBar } from '@/components/TopBar'
import { BarberCard } from '@/components/BarberCard'
import { useQuery } from '@tanstack/react-query'

export default function HomePage() {

  const shopId = process.env.NEXT_PUBLIC_SHOP_ID || 'QS001'

  type ShopSummaryResponse = {
    success: boolean
    data: {
      settings: {
        shop_id: string
        shop_name: string
      }
      barbers: Array<{
        _id: string
        barber_id: string
        name: string
        active: boolean
      }>
    }
  }

  const { data: shopSummary, isLoading } = useQuery<ShopSummaryResponse>({
    queryKey: ['shop-summary', shopId],
    queryFn: async () => {
      const res = await fetch(`https://quick-barber.vercel.app/api/admin/shop-summary?shop_id=${shopId}`, {
        next: { revalidate: 0 },
      })
      if (!res.ok) throw new Error('Failed to load shop summary')
      return res.json()
    },
    staleTime: 60_000,
  })


  // Create display barbers from API data
  const displayBarbers = shopSummary?.data?.barbers?.map((apiBarber) => ({
    id: apiBarber._id,
    name: apiBarber.name,
    isWorking: apiBarber.active,
    slots: [], // Not needed for display
    routeId: apiBarber.barber_id,
  })) || []

  const isSalonWorking = displayBarbers.some(b => b.isWorking)

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="max-w-md mx-auto p-4">
          <div className="mb-6">
            <div className="w-16 h-1 bg-primary mx-auto rounded"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="h-6 w-10 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <TopBar title={shopSummary?.data?.settings?.shop_name || 'Salon'} isWorking={isSalonWorking} showEdit={true} />
      
      <div className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <div className="w-16 h-1 bg-primary mx-auto rounded"></div>
        </div>
        
        <div className="space-y-4">
          {displayBarbers.map((barber) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              routeId={barber.routeId}
              onNotifyNext={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
