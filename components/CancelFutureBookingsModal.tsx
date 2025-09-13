import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Calendar, Clock, User, Phone } from 'lucide-react'

interface Booking {
  _id: string
  booking_id: string
  date: string
  start_time: string
  end_time: string
  customer_name: string | null
  customer_phone: string
  service_key: string
}

interface CancelFutureBookingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barberName: string
  futureBookings: Booking[]
  onCancel: () => void
  onNotify: () => void
  isNotifying?: boolean
}

export function CancelFutureBookingsModal({
  open,
  onOpenChange,
  barberName,
  futureBookings,
  onCancel,
  onNotify,
  isNotifying = false
}: CancelFutureBookingsModalProps) {

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Switch Off {barberName}
          </DialogTitle>
          <DialogDescription>
            {futureBookings.length > 0 
              ? `You have ${futureBookings.length} future booking(s). What would you like to do?`
              : 'Are you sure you want to switch off? You can choose to notify customers or not.'
            }
          </DialogDescription>
        </DialogHeader>

        {futureBookings.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            <h4 className="font-medium text-sm text-gray-700">Future Bookings:</h4>
            {futureBookings.map((booking) => (
              <Card key={booking._id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">
                        {booking.customer_name || booking.customer_phone}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {booking.customer_name && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {booking.customer_phone}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(booking.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isNotifying}
            className="flex-1"
          >
            Don&apos;t Notify
          </Button>
          <Button
            onClick={onNotify}
            disabled={isNotifying}
            className="flex-1"
          >
            {isNotifying ? 'Notifying...' : 'Notify Customers'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}