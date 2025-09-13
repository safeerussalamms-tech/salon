import { Users, Calendar } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { StatusBadge } from './StatusBadge'
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

  const handleWorkingToggle = (checked: boolean) => {
    // Update UI immediately
    setIsWorking(checked)
    
    // Call API in background
    if (routeId) {
      updateActiveMutation.mutate(checked)
    }
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
    </Card>
  )
}
