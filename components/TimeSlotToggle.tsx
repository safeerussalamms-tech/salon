import { format, parseISO } from 'date-fns'
import { Switch } from './ui/switch'

interface TimeSlotToggleProps {
  start: string
  end: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function TimeSlotToggle({ start, end, enabled, onToggle }: TimeSlotToggleProps) {
  const startTime = format(parseISO(start), 'h:00a')
  const endTime = format(parseISO(end), 'h:00a')
  
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="text-sm font-medium text-gray-900">
        {startTime} - {endTime}
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label={`Toggle availability for ${startTime} - ${endTime}`}
      />
    </div>
  )
}
