import { ArrowLeft, Clock, User, Edit } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  title: string
  isWorking: boolean
  showBack?: boolean
  showEdit?: boolean
  icon?: 'clock' | 'user'
}

export function TopBar({ title, isWorking, showBack = false, showEdit = false, icon = 'clock' }: TopBarProps) {
  const router = useRouter()

  const IconComponent = icon === 'clock' ? Clock : User

  const handleEditClick = () => {
    router.push('/edit-salon')
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <IconComponent className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{title}</span>
            <StatusBadge isWorking={isWorking} />
          </div>
        </div>
      </div>
      
      {showEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEditClick}
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
