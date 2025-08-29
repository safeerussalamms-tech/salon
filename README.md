# Salon Admin - Mobile-First Barber Shop Management

A production-ready, mobile-first Next.js application for managing a barber shop's same-day bookings. Built with Next.js 15, TypeScript, Tailwind CSS, and Zustand for state management.

## 🚀 Features

- **Mobile-first design** with responsive layout
- **Real-time booking management** with conflict detection
- **Barber availability scheduling** with hour-by-hour slots
- **Customer notification system** for next-in-line alerts
- **Accessible UI components** with proper ARIA labels
- **Toast notifications** for user feedback
- **Conflict resolution** with force-turn-off capability

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS (mobile-first)
- **UI Components**: shadcn/ui (Button, Card, Switch, Badge, Dialog, Toast)
- **State Management**: Zustand
- **Date/Time**: date-fns
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel-ready

## 📱 Screens

1. **Home** (`/`) - Salon overview with 3 barber cards
2. **Booking Details** (`/barber/[id]`) - Today's bookings for a specific barber
3. **Schedule Availability** (`/barber/[id]/schedule`) - Hour-by-hour availability management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd salon-admin
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

### Build & Deploy

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Start production
npm start
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📋 Business Rules

- **Operating Hours**: 10:00 AM - 10:00 PM (hour blocks)
- **Appointment Duration**: All appointments are 30 minutes
- **Services**: cutting, shaving, both (no additional services)
- **Conflict Resolution**: Force turn-off cancels conflicting bookings

## 🔄 Key User Flows

### 1. Notify Next Customer Flow

1. Navigate to home page (`/`)
2. Click "Notify next person" button on any working barber card
3. **Expected Result**: 
   - If customers exist: Toast shows "Message sent to next customer: [Name] at [Time]"
   - If no customers: Toast shows "No customers in queue"
   - Booking status changes to "notified"

### 2. Conflict Dialog + Force Turn Off Flow

1. Navigate to schedule page (`/barber/barber-1/schedule`)
2. Try to disable a time slot that has bookings (e.g., 10:00 AM slot)
3. **Expected Result**: 
   - Conflict dialog appears: "Cannot Turn Off"
   - Shows conflict time: "10:00 – 10:30"
   - Click "Force turn off" button
   - Toast shows: "Slot turned off. Cancelled 1 booking(s): John Smith (10:00–10:30)"
   - Slot is disabled and booking is cancelled

### 3. Barber Status Management

1. On home page, toggle the master switch for any barber
2. **Expected Result**:
   - Status badge changes between "working" (green) and "on leave" (gray)
   - Action buttons become disabled when barber is on leave
   - Button styles change to indicate disabled state

## 🏗 Project Structure

```
salon-admin/
├── app/                    # Next.js App Router pages
│   ├── barber/[id]/       # Barber-specific pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── BarberCard.tsx    # Individual barber card
│   ├── BookingListItem.tsx # Booking display item
│   ├── ConfirmDialog.tsx # Conflict resolution dialog
│   ├── StatusBadge.tsx   # Working/leave status badge
│   ├── TimeSlotToggle.tsx # Time slot switch
│   └── TopBar.tsx        # Page header component
├── hooks/                # Custom React hooks
│   └── use-toast.ts      # Toast notification hook
├── lib/                  # Utilities and store
│   ├── store.ts          # Zustand store with business logic
│   └── utils.ts          # Utility functions
├── __tests__/            # Test files
│   └── store.test.ts     # Store logic tests
└── package.json          # Dependencies and scripts
```

## 🎨 Design System

- **Primary Color**: `#2c2e65` (deep blue)
- **Status Colors**: 
  - Working: Green (`bg-green-500`)
  - On Leave: Gray (`bg-gray-300`)
- **Mobile-first**: Max-width container on larger screens
- **Accessibility**: Proper focus states, ARIA labels, screen reader support

## 🔧 Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS with custom theme
- `vercel.json` - Vercel deployment settings
- `.github/workflows/ci.yml` - GitHub Actions CI/CD
- `jest.config.js` - Jest testing configuration

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js and deploy
3. CI/CD pipeline runs on every push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to your preferred platform
# The app is optimized for Vercel but works on any Node.js hosting
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js 15, TypeScript, and Tailwind CSS**
