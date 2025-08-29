import { format, parseISO } from 'date-fns'
import { Badge } from './ui/badge'
import { Booking } from '@/lib/store'

interface BookingListItemProps {
  booking: Booking
  index: number
}

export function BookingListItem({ booking, index }: BookingListItemProps) {
  const startTime = format(parseISO(booking.start), 'h:mma')
  const endTime = format(parseISO(booking.end), 'h:mma')
  
  return (
    <div className="flex items-start gap-4 py-3 border-b last:border-b-0">
      {/* Left accent line and index */}
      <div className="flex flex-col items-center min-w-[40px]">
        <div className="w-0.5 h-full bg-primary"></div>
        <div className="text-xs text-gray-500 mt-1">{String(index + 1).padStart(2, '0')}</div>
      </div>
      
      {/* Middle content */}
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{booking.customerName}</div>
        <div className="text-sm text-gray-600">{booking.service}</div>
        {booking.status === 'notified' && (
          <Badge variant="secondary" className="mt-1 text-xs">
            notified
          </Badge>
        )}
      </div>
      
      {/* Right time info */}
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">
          {startTime} - {endTime}
        </div>
        <div className="text-xs text-gray-500">30 min</div>
      </div>
    </div>
  )
}
