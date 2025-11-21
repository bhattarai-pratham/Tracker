# Trip Tracker

A React Native mobile app for tracking vehicle trips with odometer readings.

## Why I Built This

I created this app to accurately track my time spent driving for Uber. While Uber provides a timeline of when I'm online, it doesn't account for offline work time - like driving from low-demand areas to high-demand zones. This app helps me record my actual working hours, which is essential for accurate tax reporting and maximizing deductions with my tax agent.

## Tech Stack

- React Native + Expo
- TypeScript
- Supabase (PostgreSQL)
- Expo Router
- AsyncStorage

## Features

- Start/end trips with odometer readings
- Dashboard with statistics
- Trip history
- Export to Excel/PDF
- Offline support

## Database Structure

```sql
CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  starting_odometer TEXT NOT NULL,
  ending_odometer TEXT,
  start_timestamp TIMESTAMPTZ NOT NULL,
  end_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Setup

1. `npm install`
2. Create `.env` file with Supabase credentials
3. Run SQL from `.env.example` in Supabase
4. `npx expo start`

## Project Structure

```
src/
├── app/
│   ├── (tabs)/          # Tab navigation screens
│   │   ├── index.tsx    # Dashboard
│   │   ├── Trips.tsx    # Trip history
│   │   └── More.tsx     # Settings/More
│   ├── (screens)/       # Modal screens
│   │   ├── StartTrip.tsx
│   │   ├── EndTrip.tsx
│   │   └── Export.tsx
│   └── _layout.tsx      # Root layout
├── components/          # Reusable UI components
│   ├── AppButton.tsx
│   ├── TripCard.tsx
│   └── Helpers.tsx
├── context/
│   └── TripContext.tsx  # Global state management
├── functions/
│   ├── supabase.ts      # Database client
│   ├── tripService.ts   # Trip CRUD operations
│   └── exportService.ts # Excel/PDF export logic
└── data/
    ├── tripdata.ts      # TypeScript interfaces
    └── colors.ts        # Design tokens
```
