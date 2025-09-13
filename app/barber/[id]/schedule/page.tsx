'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/TopBar'
import { TimeSlotToggle } from '@/components/TimeSlotToggle'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'

interface SchedulePageProps {
  params: Promise<{
    id: string
  }>
}

export default function SchedulePage({ params }: SchedulePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [conflictData, setConflictData] = useState<{
    slotStart: string
    conflictAt: { start: string; end: string }
  } | null>(null)
  const [id, setId] = useState<string>('')
  
  const barbers = useStore(state => state.barbers)
  const toggleSlot = useStore(state => state.toggleSlot)
  const forceTurnOffSlot = useStore(state => state.forceTurnOffSlot)
  
  useEffect(() => {
    params.then(({ id: paramId }) => setId(paramId))
  }, [params])
  
  const barber = barbers.find(b => b.id === id)
  
  if (!barber) {
    notFound()
  }

  const handleSlotToggle = (slotStart: string, enabled: boolean) => {
    const result = toggleSlot(barber.id, slotStart, enabled)
    
    if (!result.ok && result.conflictAt) {
      setConflictData({
        slotStart,
        conflictAt: result.conflictAt
      })
      setDialogOpen(true)
    }
  }

  const handleForceTurnOff = () => {
    if (!conflictData) return
    
    const result = forceTurnOffSlot(barber.id, conflictData.slotStart)
    
    const cancelledNames = result.cancelled.map(c => 
      `${c.customerName} (${c.start}–${c.end})`
    ).join(', ')
    
    toast({
      title: 'Slot Turned Off',
      description: `Slot turned off. Cancelled ${result.cancelled.length} booking(s): ${cancelledNames}`,
    })
    
    setDialogOpen(false)
    setConflictData(null)
  }

  const handleSave = () => {
    toast({
      title: 'Saved',
      description: 'Schedule changes saved successfully.',
    })
    router.back()
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <TopBar 
        title={barber.name} 
        isWorking={barber.isWorking} 
        showBack={true}
        icon="clock"
      />
      
      <div className="p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Schedule Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {barber.slots.map((slot) => (
                <TimeSlotToggle
                  key={slot.start}
                  start={slot.start}
                  end={slot.end}
                  enabled={slot.enabled}
                  onToggle={(enabled) => handleSlotToggle(slot.start, enabled)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-3">
          <Button onClick={handleSave} className="w-full">
            Save for Today & Future
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push(`/barber/${id}`)}
          >
            View current bookings
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleForceTurnOff}
        title="Cannot Turn Off"
        description="Cannot turn off; there is a customer booking at this time."
        conflictTime={conflictData ? `${conflictData.conflictAt.start} – ${conflictData.conflictAt.end}` : undefined}
      />
    </div>
  )
}
