import { Users, Calendar } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { StatusBadge } from './StatusBadge'
import { CancelFutureBookingsModal } from './CancelFutureBookingsModal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { useState, useEffect } from 'react'

interface BarberCardProps {
  barber: {
    id: string
    name: string
    isWorking: boolean
  }
  onNotifyNext: () => void
  routeId?: string
}

export function BarberCard({ barber, onNotifyNext, routeId }: BarberCardProps) {
  const { toast } = useToast()

  const shopId = process.env.NEXT_PUBLIC_SHOP_ID || 'QS001'
  const queryClient = useQueryClient()
  
  // Local state for immediate UI updates
  const [isWorking, setIsWorking] = useState(barber.isWorking)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [futureBookings, setFutureBookings] = useState<Array<{
    _id: string
    booking_id: string
    date: string
    start_time: string
    end_time: string
    customer_name: string | null
    customer_phone: string
    service_key: string
  }>>([])
  
  // Sync with prop changes
  useEffect(() => {
    setIsWorking(barber.isWorking)
  }, [barber.isWorking])

  const updateActiveMutation = useMutation({
    mutationFn: async (active: boolean) => {
      if (!routeId) return
      const res = await fetch(`/api/admin/barbers/${routeId}?shop_id=${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      const text = await res.text()
      if (!res.ok) throw new Error(text || 'Failed to update status')
      return text ? JSON.parse(text) : { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-summary', shopId] })
    },
    onError: () => {
      // revert UI
      setIsWorking(!isWorking)
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive',
      })
    },
  })

  const checkFutureBookingsMutation = useMutation({
    mutationFn: async () => {
      if (!routeId) return []
      // Get future bookings (from tomorrow onwards)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      
      console.log('Checking future bookings for date:', tomorrowStr, 'barber:', routeId)
      
      // Try to get future bookings - if API doesn't support future dates, we'll get empty array
      const res = await fetch(`https://quick-barber.vercel.app/api/admin/bookings?shop_id=${shopId}&barber_id=${routeId}&date=${tomorrowStr}`, {
        next: { revalidate: 0 },
      })
      console.log('Future bookings API response status:', res.status)
      
      if (!res.ok) {
        // If API doesn't support future dates, return empty array
        console.log('Future bookings API failed, returning empty array')
        return []
      }
      const data = await res.json()
      console.log('Future bookings API response data:', data)
      return data.data || []
    },
    onSuccess: (bookings) => {
      console.log('Future bookings found:', bookings)
      setFutureBookings(bookings)
      
      // Only show modal if there are actual future bookings
      if (bookings.length > 0) {
        setShowCancelModal(true)
      } else {
        // No future bookings, just turn off the barber directly
        updateActiveMutation.mutate(false)
      }
    },
    onError: () => {
      // If we can't check bookings, just switch off without modal
      updateActiveMutation.mutate(false)
    },
  })

  const cancelFutureBookingsMutation = useMutation({
    mutationFn: async () => {
      if (!routeId) return
      const res = await fetch(`/api/admin/barbers/${routeId}/cancel-future-bookings?shop_id=${shopId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to cancel future bookings')
      return res.json()
    },
    onSuccess: () => {
      toast({
        title: 'Customers Notified',
        description: 'Future booking customers have been notified about the cancellation.',
      })
      setShowCancelModal(false)
      updateActiveMutation.mutate(false)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive',
      })
    },
  })

  const handleWorkingToggle = (checked: boolean) => {
    // Update UI immediately
    setIsWorking(checked)
    
    if (checked) {
      // Switching ON - just update status
      if (routeId) {
        updateActiveMutation.mutate(true)
      }
    } else {
      // Switching OFF - check for future bookings first
      if (routeId) {
        checkFutureBookingsMutation.mutate()
      }
    }
  }

  const handleCancelWithoutNotify = () => {
    setShowCancelModal(false)
    updateActiveMutation.mutate(false)
  }

  const handleNotifyCustomers = () => {
    cancelFutureBookingsMutation.mutate()
  }

  const handleViewBookings = () => {
    window.location.href = `/barber/${routeId || barber.id}`
  }


  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {barber.name}
              </div>
              <StatusBadge isWorking={isWorking} />
            </div>
          </div>
          <Switch
            checked={isWorking}
            onCheckedChange={handleWorkingToggle}
            aria-label={`Toggle ${barber.name} working status`}
          />
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={async () => {
              if (!routeId) return onNotifyNext()
              try {
                const res = await fetch(`/api/admin/barbers/${routeId}/notify-next?shop_id=${shopId}`, { method: 'POST' })
                const json = await res.json()
                toast({ title: json.success ? 'Customer Notified' : 'No Customers', description: json?.message || '' })
              } catch {
                toast({ title: 'Failed', description: 'Could not notify next customer.' })
              }
            }}
            disabled={!isWorking}
            className="w-full"
            variant={isWorking ? "default" : "secondary"}
          >
            Notify next person
          </Button>
          
          <Button
            onClick={handleViewBookings}
            variant="outline"
            className="w-full"
            disabled={!isWorking}
          >
            <Calendar className="h-4 w-4 mr-2" />
            View online bookings
          </Button>
        </div>
      </CardContent>

      <CancelFutureBookingsModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        barberName={barber.name}
        futureBookings={futureBookings}
        onCancel={handleCancelWithoutNotify}
        onNotify={handleNotifyCustomers}
        isNotifying={cancelFutureBookingsMutation.isPending}
      />
    </Card>
  )
}
