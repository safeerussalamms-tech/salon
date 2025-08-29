import { renderHook, act } from '@testing-library/react'
import { useStore } from '@/lib/store'
import { parseISO } from 'date-fns'

// Mock date-fns to return a consistent date
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  startOfDay: () => new Date('2024-01-15T00:00:00.000Z'),
  addHours: (date: Date, hours: number) => {
    const newDate = new Date(date)
    newDate.setHours(newDate.getHours() + hours)
    return newDate
  },
  isToday: () => true,
  format: jest.requireActual('date-fns').format,
  parseISO: jest.requireActual('date-fns').parseISO,
}))

describe('Salon Store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useStore())
    act(() => {
      result.current.bookings = [
        {
          id: 'booking-1',
          customerName: 'John Smith',
          service: 'both',
          start: new Date('2024-01-15T10:00:00.000Z').toISOString(),
          end: new Date('2024-01-15T10:30:00.000Z').toISOString(),
          barberId: 'barber-1',
          status: 'booked'
        },
        {
          id: 'booking-2',
          customerName: 'Mike Johnson',
          service: 'cutting',
          start: new Date('2024-01-15T11:00:00.000Z').toISOString(),
          end: new Date('2024-01-15T11:30:00.000Z').toISOString(),
          barberId: 'barber-1',
          status: 'booked'
        }
      ]
    })
  })

  describe('notifyNextCustomer', () => {
    it('should notify the earliest booked customer and mark as notified', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        const response = result.current.notifyNextCustomer('barber-1')
        expect(response.booking?.customerName).toBe('John Smith')
        expect(response.message).toContain('Message sent to next customer: John Smith at 10:00')
      })

      const bookings = result.current.getTodaysBookings('barber-1')
      const notifiedBooking = bookings.find(b => b.id === 'booking-1')
      expect(notifiedBooking?.status).toBe('notified')
    })

    it('should return no customers message when no booked customers exist', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        // Mark all bookings as notified
        result.current.bookings = result.current.bookings.map(b => ({ ...b, status: 'notified' as const }))
      })

      act(() => {
        const response = result.current.notifyNextCustomer('barber-1')
        expect(response.message).toBe('No customers in queue.')
        expect(response.booking).toBeUndefined()
      })
    })
  })

  describe('toggleSlot', () => {
    it('should enable a slot successfully', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        // First disable a slot
        result.current.barbers = result.current.barbers.map(barber => 
          barber.id === 'barber-1' 
            ? {
                ...barber,
                slots: barber.slots.map(slot => 
                  slot.start === new Date('2024-01-15T10:00:00.000Z').toISOString()
                    ? { ...slot, enabled: false }
                    : slot
                )
              }
            : barber
        )
      })

      act(() => {
        const response = result.current.toggleSlot('barber-1', new Date('2024-01-15T10:00:00.000Z').toISOString(), true)
        expect(response.ok).toBe(true)
      })

      const barber = result.current.barbers.find(b => b.id === 'barber-1')
      const slot = barber?.slots.find(s => s.start === new Date('2024-01-15T10:00:00.000Z').toISOString())
      expect(slot?.enabled).toBe(true)
    })

    it('should prevent disabling a slot with conflicting bookings', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        const response = result.current.toggleSlot('barber-1', new Date('2024-01-15T10:00:00.000Z').toISOString(), false)
        expect(response.ok).toBe(false)
        expect(response.conflictAt).toEqual({
          start: '10:00',
          end: '10:30'
        })
      })

      const barber = result.current.barbers.find(b => b.id === 'barber-1')
      const slot = barber?.slots.find(s => s.start === new Date('2024-01-15T10:00:00.000Z').toISOString())
      expect(slot?.enabled).toBe(true) // Should remain enabled
    })

    it('should allow disabling a slot with no conflicts', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        const response = result.current.toggleSlot('barber-1', new Date('2024-01-15T12:00:00.000Z').toISOString(), false)
        expect(response.ok).toBe(true)
      })

      const barber = result.current.barbers.find(b => b.id === 'barber-1')
      const slot = barber?.slots.find(s => s.start === new Date('2024-01-15T12:00:00.000Z').toISOString())
      expect(slot?.enabled).toBe(false)
    })
  })

  describe('forceTurnOffSlot', () => {
    it('should cancel conflicting bookings and disable slot', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        const response = result.current.forceTurnOffSlot('barber-1', new Date('2024-01-15T10:00:00.000Z').toISOString())
        expect(response.cancelled).toHaveLength(1)
        expect(response.cancelled[0].customerName).toBe('John Smith')
        expect(response.cancelled[0].start).toBe('10:00')
        expect(response.cancelled[0].end).toBe('10:30')
      })

      // Check that the booking was cancelled
      const bookings = result.current.getTodaysBookings('barber-1')
      const cancelledBooking = result.current.bookings.find(b => b.id === 'booking-1')
      expect(cancelledBooking?.status).toBe('cancelled')

      // Check that the slot was disabled
      const barber = result.current.barbers.find(b => b.id === 'barber-1')
      const slot = barber?.slots.find(s => s.start === new Date('2024-01-15T10:00:00.000Z').toISOString())
      expect(slot?.enabled).toBe(false)
    })

    it('should return empty array when no conflicts exist', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        const response = result.current.forceTurnOffSlot('barber-1', new Date('2024-01-15T12:00:00.000Z').toISOString())
        expect(response.cancelled).toHaveLength(0)
      })

      // Check that the slot was disabled
      const barber = result.current.barbers.find(b => b.id === 'barber-1')
      const slot = barber?.slots.find(s => s.start === new Date('2024-01-15T12:00:00.000Z').toISOString())
      expect(slot?.enabled).toBe(false)
    })
  })

  describe('getTodaysBookings', () => {
    it('should return only today\'s bookings for the specified barber', () => {
      const { result } = renderHook(() => useStore())
      
      const bookings = result.current.getTodaysBookings('barber-1')
      expect(bookings).toHaveLength(2)
      expect(bookings.every(b => b.barberId === 'barber-1')).toBe(true)
    })

    it('should exclude cancelled bookings', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.bookings = result.current.bookings.map(b => 
          b.id === 'booking-1' ? { ...b, status: 'cancelled' as const } : b
        )
      })

      const bookings = result.current.getTodaysBookings('barber-1')
      expect(bookings).toHaveLength(1)
      expect(bookings[0].id).toBe('booking-2')
    })
  })

  describe('toggleBarberWorking', () => {
    it('should toggle barber working status', () => {
      const { result } = renderHook(() => useStore())
      
      const barber = result.current.barbers.find(b => b.id === 'barber-1')
      expect(barber?.isWorking).toBe(true)

      act(() => {
        result.current.toggleBarberWorking('barber-1', false)
      })

      const updatedBarber = result.current.barbers.find(b => b.id === 'barber-1')
      expect(updatedBarber?.isWorking).toBe(false)
    })
  })
})
