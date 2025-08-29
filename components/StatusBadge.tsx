import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  isWorking: boolean
}

export function StatusBadge({ isWorking }: StatusBadgeProps) {
  return (
    <Badge 
      variant={isWorking ? "default" : "secondary"}
      className={isWorking ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 text-gray-700"}
    >
      {isWorking ? 'working' : 'on leave'}
    </Badge>
  )
}
