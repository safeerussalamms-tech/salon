import { Users, Calendar } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { StatusBadge } from './StatusBadge'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Barber } from '@/lib/store'

interface BarberCardProps {
  barber: Barber
  onNotifyNext: () => void
}

export function BarberCard({ barber, onNotifyNext }: BarberCardProps) {
  const router = useRouter()
  const toggleBarberWorking = useStore(state => state.toggleBarberWorking)

  const handleWorkingToggle = (checked: boolean) => {
    toggleBarberWorking(barber.id, checked)
  }

  const handleViewBookings = () => {
    router.push(`/barber/${barber.id}`)
  }

  const handleBarberNameClick = () => {
    router.push(`/barber/${barber.id}/schedule`)
  }

  const handleBarberIconClick = () => {
    router.push(`/barber/${barber.id}/schedule`)
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={handleBarberIconClick}
            >
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <div 
                className="font-semibold text-gray-900 cursor-pointer hover:text-primary transition-colors"
                onClick={handleBarberNameClick}
              >
                {barber.name}
              </div>
              <StatusBadge isWorking={barber.isWorking} />
            </div>
          </div>
          <Switch
            checked={barber.isWorking}
            onCheckedChange={handleWorkingToggle}
            aria-label={`Toggle ${barber.name} working status`}
          />
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={onNotifyNext}
            disabled={!barber.isWorking}
            className="w-full"
            variant={barber.isWorking ? "default" : "secondary"}
          >
            Notify next person
          </Button>
          
          <Button
            onClick={handleViewBookings}
            variant="outline"
            className="w-full"
            disabled={!barber.isWorking}
          >
            <Calendar className="h-4 w-4 mr-2" />
            View online bookings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
