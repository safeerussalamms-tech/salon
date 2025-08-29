'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit, Save, ArrowLeft } from 'lucide-react'

export default function EditSalonPage() {
  const router = useRouter()
  const { toast } = useToast()
  const salonName = useStore(state => state.salonName)
  const barbers = useStore(state => state.barbers)
  const updateSalonName = useStore(state => state.updateSalonName)
  const updateBarberName = useStore(state => state.updateBarberName)
  const addBarber = useStore(state => state.addBarber)
  const removeBarber = useStore(state => state.removeBarber)

  const [newSalonName, setNewSalonName] = useState(salonName)
  const [newBarberName, setNewBarberName] = useState('')
  const [editingBarber, setEditingBarber] = useState<string | null>(null)
  const [editingNames, setEditingNames] = useState<{ [key: string]: string }>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [barberToDelete, setBarberToDelete] = useState<{ id: string; name: string } | null>(null)

  // Sync local state with store changes
  useEffect(() => {
    setNewSalonName(salonName)
  }, [salonName])

  const handleSaveSalonName = () => {
    if (newSalonName.trim()) {
      updateSalonName(newSalonName.trim())
      toast({
        title: 'Salon Name Updated',
        description: 'Salon name has been updated successfully.',
      })
    }
  }

  const handleAddBarber = () => {
    if (newBarberName.trim()) {
      addBarber(newBarberName.trim())
      setNewBarberName('')
      toast({
        title: 'Barber Added',
        description: `Barber "${newBarberName.trim()}" has been added successfully.`,
      })
    }
  }

  const handleStartEditBarber = (barberId: string, currentName: string) => {
    setEditingBarber(barberId)
    setEditingNames(prev => ({ ...prev, [barberId]: currentName }))
  }

  const handleSaveBarberName = (barberId: string) => {
    const newName = editingNames[barberId]?.trim()
    if (newName) {
      updateBarberName(barberId, newName)
      setEditingBarber(null)
      toast({
        title: 'Barber Name Updated',
        description: `Barber name has been updated to "${newName}".`,
      })
    }
  }

  const handleDeleteBarberClick = (barberId: string, barberName: string) => {
    if (barbers.length > 1) {
      setBarberToDelete({ id: barberId, name: barberName })
      setDeleteDialogOpen(true)
    } else {
      toast({
        title: 'Cannot Remove',
        description: 'At least one barber must remain in the salon.',
      })
    }
  }

  const handleConfirmDelete = () => {
    if (barberToDelete) {
      removeBarber(barberToDelete.id)
      toast({
        title: 'Barber Removed',
        description: `Barber "${barberToDelete.name}" has been removed.`,
      })
      setDeleteDialogOpen(false)
      setBarberToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar 
        title="Edit Salon" 
        isWorking={barbers.some(b => b.isWorking)} 
        showBack={true}
        icon="user"
      />
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Salon Name Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Salon Name</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              value={newSalonName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSalonName(e.target.value)}
              placeholder="Enter salon name"
              className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
            <Button 
              onClick={handleSaveSalonName} 
              className="w-full h-12 text-base font-medium"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Salon Name
            </Button>
          </CardContent>
        </Card>

        {/* Add New Barber Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Add New Barber</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              value={newBarberName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBarberName(e.target.value)}
              placeholder="Enter barber name"
              className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddBarber()}
            />
            <Button 
              onClick={handleAddBarber} 
              className="w-full h-12 text-base font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Barber
            </Button>
          </CardContent>
        </Card>

        {/* Existing Barbers Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Edit Barbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {barbers.map((barber) => (
                <div key={barber.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  {editingBarber === barber.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingNames[barber.id] || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingNames(prev => ({ 
                          ...prev, 
                          [barber.id]: e.target.value 
                        }))}
                        className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSaveBarberName(barber.id)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleSaveBarberName(barber.id)} 
                          className="flex-1 h-12 text-base font-medium"
                        >
                          <Save className="h-5 w-5 mr-2" />
                          Save
                        </Button>
                        <Button 
                          onClick={() => setEditingBarber(null)} 
                          variant="outline"
                          className="flex-1 h-12 text-base font-medium"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-900">{barber.name}</span>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleStartEditBarber(barber.id, barber.name)} 
                          size="icon"
                          variant="outline"
                          className="h-10 w-10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteBarberClick(barber.id, barber.name)} 
                          size="icon"
                          variant="outline"
                          className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save and Back Button */}
        <div className="pt-4 pb-8">
          <Button 
            onClick={() => router.back()} 
            className="w-full h-14 text-lg font-semibold shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Save and Back
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Barber"
        description={`Are you sure you want to delete "${barberToDelete?.name}"? This action cannot be undone.`}
        cancelText="Cancel"
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  )
}
