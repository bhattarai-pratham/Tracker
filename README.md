<div align="center">
  <h1>Trip Tracker</h1>
  <p>A React Native mobile app for tracking vehicle trips with odometer readings and managing business receipts.</p>
</div>

## Screenshots

<div align="center">
  <img src="https://raw.githubusercontent.com/bhattarai-pratham/Tracker/master/src/assets/images/app_images/view_dashboard.png" width="250" alt="Dashboard"/>
  <img src="https://raw.githubusercontent.com/bhattarai-pratham/Tracker/master/src/assets/images/app_images/analyze_kpi.png" width="250" alt="Analyze KPIs"/>
  <img src="https://raw.githubusercontent.com/bhattarai-pratham/Tracker/master/src/assets/images/app_images/track_you_trip_part1.png" width="250" alt="Track Your Trips"/>
  <img src="https://raw.githubusercontent.com/bhattarai-pratham/Tracker/master/src/assets/images/app_images/track_you_trip_part2.png" width="250" alt="Trip Details"/>
</div>

<div align="center">
  <img src="https://raw.githubusercontent.com/bhattarai-pratham/Tracker/master/src/assets/images/app_images/manage_receipts.png" width="250" alt="Manage Receipts"/>
  <img src="https://raw.githubusercontent.com/bhattarai-pratham/Tracker/master/src/assets/images/app_images/quick_search.png" width="250" alt="Quick Search"/>
  <img src="https://raw.githubusercontent.com/bhattarai-pratham/Tracker/master/src/assets/images/app_images/log_miles.png" width="250" alt="Log Miles"/>
  <img src="https://raw.githubusercontent.com/bhattarai-pratham/Tracker/master/src/assets/images/app_images/export.png" width="250" alt="Export Reports"/>
</div>

## Why I Built This

I created this app to accurately track my time spent driving for Uber. While Uber provides a timeline of when I'm online, it doesn't account for offline work time - like driving from low-demand areas to high-demand zones. This app helps me record my actual working hours, which is essential for accurate tax reporting and maximizing deductions with my tax agent.

## Tech Stack

- React Native + Expo
- TypeScript
- Supabase (PostgreSQL + Storage)
- Expo Router (File-based routing)
- AsyncStorage (Offline persistence)
- Expo Camera (Photo capture)
- Expo Print (PDF generation)

## Features

- Start/end trips with odometer readings
- Photo capture for trip verification (start/end photos)
- Dashboard with comprehensive KPIs (distance, duration, earnings, speed)
- Trip history with earnings tracking
- Receipt management with categorization
- Receipt photo storage
- Date range filtering and search
- Export trips to PDF with customizable date ranges
- Offline support with local storage
- Pull-to-refresh data synchronization

## Database Structure

```sql
-- Trips table
CREATE TABLE trips_dummy (
  id TEXT PRIMARY KEY,
  starting_odometer TEXT NOT NULL,
  ending_odometer TEXT,
  start_timestamp TIMESTAMPTZ NOT NULL,
  end_timestamp TIMESTAMPTZ,
  earnings NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipts table
CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  receipt_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT NOT NULL,
  description TEXT,
  subtotal NUMERIC NOT NULL,
  gst NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  receipt_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage buckets
-- trips_photos: Stores trip start/end photos and receipt images
```

## Setup

1. `npm install`
2. Create `.env` file with Supabase credentials
3. Run SQL from `.env.example` in Supabase
4. Create storage bucket `trips_photos` with public access
5. `npx expo start`

## Project Structure

```
src/
├── app/
│   ├── (tabs)/          # Tab navigation screens
│   │   ├── index.tsx    # Dashboard with KPIs
│   │   ├── Trips.tsx    # Trip history
│   │   └── Reciepts.tsx # Receipt management
│   ├── (screens)/       # Modal/stack screens
│   │   ├── StartTrip.tsx
│   │   ├── EndTrip.tsx
│   │   ├── AddReceipt.tsx
│   │   ├── [tripID].tsx    # Trip details
│   │   ├── [receiptID].tsx # Receipt details
│   │   ├── Examples.tsx
│   │   └── (export)/       # Export functionality
│   └── _layout.tsx      # Root layout
├── components/          # Reusable UI components
│   ├── AppButton.tsx
│   └── TripPhotoCapture.tsx
├── context/
│   └── TripContext.tsx  # Global state management
├── functions/
│   ├── supabase.ts      # Database client
│   ├── tripService.ts   # Trip CRUD + photo upload
│   ├── receiptService.ts # Receipt CRUD + photo upload
│   ├── exportService.ts # PDF export logic
│   └── Helpers.tsx      # Utility functions
├── assets/
│   ├── colors.ts        # Design tokens
│   ├── Icons.tsx        # Custom icons
│   └── images/          # App images
└── data/
    └── tripdata.ts      # TypeScript interfaces
```
