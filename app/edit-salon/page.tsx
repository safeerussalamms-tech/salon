'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit, Save, ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function EditSalonPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [newSalonName, setNewSalonName] = useState('')
  const [newBarberName, setNewBarberName] = useState('')
  const [editingBarber, setEditingBarber] = useState<string | null>(null)
  const [editingNames, setEditingNames] = useState<{ [key: string]: string }>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [barberToDelete, setBarberToDelete] = useState<{ id: string; name: string } | null>(null)

  const shopId = process.env.NEXT_PUBLIC_SHOP_ID || 'QS001'

  type ShopSummaryResponse = {
    success: boolean
    data: {
      settings: { shop_id: string; shop_name: string }
      barbers: Array<{ _id: string; barber_id: string; name: string; active: boolean }>
    }
  }

  const { data: shopSummary } = useQuery<ShopSummaryResponse>({
    queryKey: ['shop-summary', shopId],
    queryFn: async () => {
      const res = await fetch(`https://quick-barber.vercel.app/api/admin/shop-summary?shop_id=${shopId}`)
      if (!res.ok) throw new Error('Failed to load shop summary')
      return res.json()
    },
    staleTime: 60_000,
  })

  const queryClient = useQueryClient()

  const updateNameMutation = useMutation({
    mutationFn: async ({ barberId, name }: { barberId: string; name: string }) => {
      const res = await fetch(`/api/admin/barbers/${barberId}?shop_id=${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to update name')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-summary', shopId] })
    },
  })

  const addBarberMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`https://quick-barber.vercel.app/api/admin/barbers?shop_id=${shopId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to add barber')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-summary', shopId] })
      toast({
        title: 'Barber Added',
        description: 'Barber has been added successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add barber. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const deleteBarberMutation = useMutation({
    mutationFn: async (barberId: string) => {
      const res = await fetch(`https://quick-barber.vercel.app/api/admin/barbers/${barberId}?shop_id=${shopId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to delete barber')
      return res.json()
    },
    onSuccess: (data, barberId) => {
      queryClient.invalidateQueries({ queryKey: ['shop-summary', shopId] })
      // Find the barber name that was deleted
      const deletedBarber = shopSummary?.data?.barbers?.find(b => b.barber_id === barberId)
      const barberName = deletedBarber?.name || 'Barber'
      toast({
        title: 'Barber Deleted',
        description: `${barberName} has been deleted successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete barber. Please try again.',
        variant: 'destructive',
      })
    },
  })

  // Sync local state with API data
  useEffect(() => {
    setNewSalonName(shopSummary?.data?.settings?.shop_name || '')
  }, [shopSummary?.data?.settings?.shop_name])

  const handleSaveSalonName = () => {
    if (newSalonName.trim()) {
      // TODO: Implement salon name update API call
      toast({
        title: 'Salon Name Updated',
        description: 'Salon name has been updated successfully.',
      })
    }
  }

  const handleAddBarber = () => {
    if (newBarberName.trim()) {
      addBarberMutation.mutate(newBarberName.trim())
      setNewBarberName('')
    }
  }

  const handleStartEditBarber = (barberId: string, currentName: string) => {
    setEditingBarber(barberId)
    setEditingNames(prev => ({ ...prev, [barberId]: currentName }))
  }

  const handleSaveBarberName = (barberId: string) => {
    const newName = editingNames[barberId]?.trim()
    if (!newName) {
      toast({ title: 'Invalid name', description: 'Name cannot be empty.' })
      return
    }
    
    // Find the barber_id for the API call
    const apiBarber = shopSummary?.data?.barbers?.find(b => b._id === barberId)
    if (apiBarber?.barber_id) {
      updateNameMutation.mutate({ barberId: apiBarber.barber_id, name: newName })
      setEditingBarber(null)
      toast({
        title: 'Barber Name Updated',
        description: `Barber name has been updated to "${newName}".`,
      })
    } else {
      toast({
        title: 'Error',
        description: 'Could not find barber ID for update.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteBarberClick = (barberId: string, barberName: string) => {
    if ((shopSummary?.data?.barbers?.length || 0) > 1) {
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
      // Find the barber_id for the API call
      const apiBarber = shopSummary?.data?.barbers?.find(b => b._id === barberToDelete.id)
      if (apiBarber?.barber_id) {
        deleteBarberMutation.mutate(apiBarber.barber_id)
        setDeleteDialogOpen(false)
        setBarberToDelete(null)
      } else {
        toast({
          title: 'Error',
          description: 'Could not find barber ID for deletion.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar 
        title={shopSummary?.data?.settings?.shop_name || 'Edit Salon'} 
        isWorking={shopSummary?.data?.barbers?.some(b => b.active) || false} 
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
              disabled={addBarberMutation.isPending || !newBarberName.trim()}
              className="w-full h-12 text-base font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              {addBarberMutation.isPending ? 'Adding...' : 'Add Barber'}
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
              {shopSummary?.data?.barbers?.map((apiBarber, index) => {
                const displayName = apiBarber.name
                return (
                <div key={apiBarber._id} className="bg-white border border-gray-200 rounded-lg p-4">
                  {editingBarber === apiBarber._id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingNames[apiBarber._id] || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingNames(prev => ({ 
                          ...prev, 
                          [apiBarber._id]: e.target.value 
                        }))}
                        className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSaveBarberName(apiBarber._id)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleSaveBarberName(apiBarber._id)} 
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
                      <span className="text-lg font-medium text-gray-900">{displayName}</span>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleStartEditBarber(apiBarber._id, displayName)} 
                          size="icon"
                          variant="outline"
                          className="h-10 w-10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteBarberClick(apiBarber._id, displayName)} 
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
              )})}
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
        confirmText={deleteBarberMutation.isPending ? "Deleting..." : "Delete"}
        confirmVariant="destructive"
        disabled={deleteBarberMutation.isPending}
      />
    </div>
  )
}
