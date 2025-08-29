'use client'

import { TopBar } from '@/components/TopBar'
import { BarberCard } from '@/components/BarberCard'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

export default function HomePage() {
  const salonName = useStore(state => state.salonName)
  const barbers = useStore(state => state.barbers)
  const notifyNextCustomer = useStore(state => state.notifyNextCustomer)
  const { toast } = useToast()

  // Calculate salon working status based on whether any barbers are working
  const isSalonWorking = barbers.some(barber => barber.isWorking)

  const handleNotifyNext = (barberId: string) => {
    const result = notifyNextCustomer(barberId)
    toast({
      title: result.booking ? 'Customer Notified' : 'No Customers',
      description: result.message,
    })
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <TopBar title={salonName} isWorking={isSalonWorking} showEdit={true} />
      
      <div className="p-4">
        <div className="mb-6">
          <div className="w-16 h-1 bg-primary mx-auto rounded"></div>
        </div>
        
        <div className="space-y-4">
          {barbers.map((barber) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              onNotifyNext={() => handleNotifyNext(barber.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
