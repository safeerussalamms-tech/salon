'use client'

import { TopBar } from '@/components/TopBar'
import { BookingListItem } from '@/components/BookingListItem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { notFound } from 'next/navigation'

interface BarberPageProps {
  params: {
    id: string
  }
}

export default function BarberPage({ params }: BarberPageProps) {
  const barbers = useStore(state => state.barbers)
  const getTodaysBookings = useStore(state => state.getTodaysBookings)
  
  const barber = barbers.find(b => b.id === params.id)
  
  if (!barber) {
    notFound()
  }
  
  // Calculate salon working status based on whether any barbers are working
  const isSalonWorking = barbers.some(b => b.isWorking)
  
  const todaysBookings = getTodaysBookings(barber.id)

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <TopBar 
        title={barber.name} 
        isWorking={isSalonWorking} 
        showBack={true}
        icon="user"
      />
      
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No bookings for today
              </div>
            ) : (
              <div className="space-y-0">
                {todaysBookings.map((booking, index) => (
                  <BookingListItem
                    key={booking.id}
                    booking={booking}
                    index={index}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
