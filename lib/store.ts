import { create } from 'zustand'
import { format, parseISO, startOfDay, addHours, isToday } from 'date-fns'

export type Service = 'cutting' | 'shaving' | 'both'

export type Booking = {
  id: string
  customerName: string
  service: Service
  start: string // ISO
  end: string   // ISO
  barberId: string
  status: 'booked' | 'notified' | 'cancelled'
}

export type TimeSlot = { 
  start: string
  end: string
  enabled: boolean 
}

export type Barber = {
  id: string
  name: string            // 'BARBER1', etc.
  isWorking: boolean      // master switch
  slots: TimeSlot[]       // hour blocks 10:00–22:00
}

type Store = {
  salonName: string
  barbers: Barber[]
  bookings: Booking[]
  getTodaysBookings: (barberId: string) => Booking[]
  notifyNextCustomer: (barberId: string) => { booking?: Booking; message: string }
  toggleBarberWorking: (barberId: string, on: boolean) => void
  toggleSlot: (barberId: string, slotStartIso: string, enabled: boolean) => 
    { ok: boolean; conflictAt?: { start: string; end: string } }
  forceTurnOffSlot: (barberId: string, slotStartIso: string) => 
    { cancelled: { id: string; customerName: string; start: string; end: string }[] }
  updateSalonName: (name: string) => void
  updateBarberName: (barberId: string, name: string) => void
  addBarber: (name: string) => void
  removeBarber: (barberId: string) => void
}

// Generate hour blocks from 10:00 to 22:00
const generateHourBlocks = (): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const today = startOfDay(new Date())
  
  for (let hour = 10; hour < 22; hour++) {
    const start = addHours(today, hour)
    const end = addHours(today, hour + 1)
    
    slots.push({
      start: start.toISOString(),
      end: end.toISOString(),
      enabled: true
    })
  }
  
  return slots
}

// Sample bookings data
const sampleBookings: Booking[] = [
  {
    id: 'booking-1',
    customerName: 'John Smith',
    service: 'both',
    start: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    barberId: 'barber-1',
    status: 'booked'
  },
  {
    id: 'booking-2',
    customerName: 'Mike Johnson',
    service: 'cutting',
    start: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
    barberId: 'barber-1',
    status: 'booked'
  },
  {
    id: 'booking-3',
    customerName: 'David Wilson',
    service: 'shaving',
    start: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
    barberId: 'barber-1',
    status: 'booked'
  },
  {
    id: 'booking-4',
    customerName: 'Robert Brown',
    service: 'cutting',
    start: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
    barberId: 'barber-1',
    status: 'booked'
  },
  {
    id: 'booking-5',
    customerName: 'James Davis',
    service: 'both',
    start: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(),
    barberId: 'barber-2',
    status: 'booked'
  },
  {
    id: 'booking-6',
    customerName: 'William Miller',
    service: 'cutting',
    start: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    barberId: 'barber-2',
    status: 'booked'
  }
]

export const useStore = create<Store>((set, get) => ({
  salonName: 'SALON NAME',
  barbers: [
    {
      id: 'barber-1',
      name: 'BARBER1',
      isWorking: true,
      slots: generateHourBlocks()
    },
    {
      id: 'barber-2',
      name: 'BARBER2',
      isWorking: true,
      slots: generateHourBlocks()
    },
    {
      id: 'barber-3',
      name: 'BARBER3',
      isWorking: false,
      slots: generateHourBlocks()
    }
  ],
  bookings: sampleBookings,

  getTodaysBookings: (barberId: string) => {
    const { bookings } = get()
    return bookings.filter(booking => 
      booking.barberId === barberId && 
      isToday(parseISO(booking.start)) &&
      booking.status !== 'cancelled'
    ).sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
  },

  notifyNextCustomer: (barberId: string) => {
    const { bookings } = get()
    const todaysBookings = bookings.filter(booking => 
      booking.barberId === barberId && 
      isToday(parseISO(booking.start)) &&
      booking.status === 'booked'
    ).sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())

    if (todaysBookings.length === 0) {
      return { message: 'No customers in queue.' }
    }

    const nextBooking = todaysBookings[0]
    
    set(state => ({
      bookings: state.bookings.map(booking => 
        booking.id === nextBooking.id 
          ? { ...booking, status: 'notified' as const }
          : booking
      )
    }))

    return { 
      booking: nextBooking, 
      message: `Message sent to next customer: ${nextBooking.customerName} at ${format(parseISO(nextBooking.start), 'HH:mm')}.` 
    }
  },

  toggleBarberWorking: (barberId: string, on: boolean) => {
    set(state => ({
      barbers: state.barbers.map(barber => 
        barber.id === barberId 
          ? { ...barber, isWorking: on }
          : barber
      )
    }))
  },

  toggleSlot: (barberId: string, slotStartIso: string, enabled: boolean) => {
    if (enabled) {
      // Enabling a slot - always allowed
      set(state => ({
        barbers: state.barbers.map(barber => 
          barber.id === barberId 
            ? {
                ...barber,
                slots: barber.slots.map(slot => 
                  slot.start === slotStartIso 
                    ? { ...slot, enabled: true }
                    : slot
                )
              }
            : barber
        )
      }))
      return { ok: true }
    } else {
      // Disabling a slot - check for conflicts
      const { bookings } = get()
      const slotStart = parseISO(slotStartIso)
      const slotEnd = addHours(slotStart, 1)
      
      const conflictingBookings = bookings.filter(booking => 
        booking.barberId === barberId &&
        booking.status !== 'cancelled' &&
        parseISO(booking.start) < slotEnd &&
        parseISO(booking.end) > slotStart
      )

      if (conflictingBookings.length > 0) {
        const conflict = conflictingBookings[0]
        return { 
          ok: false, 
          conflictAt: { 
            start: format(parseISO(conflict.start), 'HH:mm'),
            end: format(parseISO(conflict.end), 'HH:mm')
          }
        }
      }

      // No conflicts, safe to disable
      set(state => ({
        barbers: state.barbers.map(barber => 
          barber.id === barberId 
            ? {
                ...barber,
                slots: barber.slots.map(slot => 
                  slot.start === slotStartIso 
                    ? { ...slot, enabled: false }
                    : slot
                )
              }
            : barber
        )
      }))
      return { ok: true }
    }
  },

  forceTurnOffSlot: (barberId: string, slotStartIso: string) => {
    const { bookings } = get()
    const slotStart = parseISO(slotStartIso)
    const slotEnd = addHours(slotStart, 1)
    
    const conflictingBookings = bookings.filter(booking => 
      booking.barberId === barberId &&
      booking.status !== 'cancelled' &&
      parseISO(booking.start) < slotEnd &&
      parseISO(booking.end) > slotStart
    )

    // Cancel conflicting bookings
    set(state => ({
      bookings: state.bookings.map(booking => 
        conflictingBookings.some(conflict => conflict.id === booking.id)
          ? { ...booking, status: 'cancelled' as const }
          : booking
      ),
      barbers: state.barbers.map(barber => 
        barber.id === barberId 
          ? {
              ...barber,
              slots: barber.slots.map(slot => 
                slot.start === slotStartIso 
                  ? { ...slot, enabled: false }
                  : slot
              )
            }
          : barber
      )
    }))

    return {
      cancelled: conflictingBookings.map(booking => ({
        id: booking.id,
        customerName: booking.customerName,
        start: format(parseISO(booking.start), 'HH:mm'),
        end: format(parseISO(booking.end), 'HH:mm')
      }))
    }
  },

  updateSalonName: (name: string) => {
    set({ salonName: name })
  },

  updateBarberName: (barberId: string, name: string) => {
    set(state => ({
      barbers: state.barbers.map(barber => 
        barber.id === barberId 
          ? { ...barber, name }
          : barber
      )
    }))
  },

  addBarber: (name: string) => {
    const { barbers } = get()
    const newId = `barber-${barbers.length + 1}`
    
    set(state => ({
      barbers: [...state.barbers, {
        id: newId,
        name,
        isWorking: false,
        slots: generateHourBlocks()
      }]
    }))
  },

  removeBarber: (barberId: string) => {
    set(state => ({
      barbers: state.barbers.filter(barber => barber.id !== barberId)
    }))
  }
}))
