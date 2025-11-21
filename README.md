# Trip Tracker# Trip Tracker v2# Welcome to your Expo app 👋

A mobile trip tracking application for managing vehicle trips with odometer readings.A React Native trip tracking application built with Expo and Supabase for managing vehicle trips with odometer readings.This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Tech Stack## Features## Get started

- **React Native** with Expo SDK 54- 🚗 **Trip Tracking**: Start and end trips with odometer readings1. Install dependencies

- **TypeScript** for type safety

- **Expo Router** for file-based navigation- 📊 **Dashboard**: View comprehensive trip statistics and KPIs

- **Supabase** (PostgreSQL) for backend

- **Context API + AsyncStorage** for state management- 📋 **Trip History**: Browse all past trips with detailed information ```bash

- **Excel & PDF export** functionality

- 📤 **Export**: Export trip data to Excel or PDF npm install

## Features

- 💾 **Offline Support**: App state persists using AsyncStorage ```

- Start/end trips with odometer readings

- Dashboard with trip statistics and KPIs- 🔄 **Pull to Refresh**: Update data on all screens

- Trip history with detailed view

- Export data to Excel or PDF- 📱 **Native Experience**: Built for Android with native performance

- Offline support with local persistence

- Pull-to-refresh on all screens## Tech Stack ```bash

## Key Implementation Highlightsnpx expo start

- **Type-safe architecture** with TypeScript interfaces- **Framework**: React Native with Expo SDK 54 ```

- **Offline-first design** with AsyncStorage persistence

- **Custom service layer** for database operations- **Routing**: Expo Router (file-based routing)

- **Reusable components** with consistent styling

- **Context API** for global state management- **Database**: Supabase (PostgreSQL)In the output, you'll find options to open the app in a

- **File-based routing** with Expo Router

- **Export functionality** supporting Excel & PDF formats- **State Management**: React Context API + AsyncStorage

## Project Structure- **UI**: Custom components with React Native- [development build](https://docs.expo.dev/develop/development-builds/introduction/)

````- **TypeScript**: Full type safety- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)

src/

├── app/                    # Screens (Expo Router)- **Export**: XLSX (Excel) + expo-print (PDF)- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

│   ├── (tabs)/            # Tab navigation

│   └── (screens)/         # Modal screens- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

├── components/            # Reusable UI components

├── context/               # React Context providers## Prerequisites

├── functions/             # Business logic & services

│   ├── supabase.ts       # Database clientYou can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

│   ├── tripService.ts    # CRUD operations

│   └── exportService.ts  # Export logic- Node.js 18+

└── data/                  # TypeScript interfaces

```- npm or yarn## Get a fresh project



## Setup- Expo CLI



### 1. Install dependencies- Android Studio (for local builds) or EAS account (for cloud builds)When you're ready, run:



```bash## Setup```bash

npm install

```npm run reset-project



### 2. Configure environment variables### 1. Clone the repository```



Create a `.env` file:```bashThis command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.



```propertiesgit clone <your-repo-url>

SUPABASE_URL=your_supabase_url

SUPABASE_KEY=your_supabase_keycd tracker-v2## Learn more

````

`````

### 3. Database setup

To learn more about developing your project with Expo, look at the following resources:

Run in Supabase SQL Editor:

### 2. Install dependencies

```sql

CREATE TABLE trips (- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).

  id TEXT PRIMARY KEY,

  starting_odometer TEXT NOT NULL,````bash- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

  start_timestamp TEXT NOT NULL,

  ending_odometer TEXT,npm install

  end_timestamp TEXT,

  created_at TIMESTAMP DEFAULT NOW()```## Join the community

);



CREATE INDEX idx_trips_start_timestamp ON trips(start_timestamp DESC);

```### 3. Configure Environment VariablesJoin our community of developers creating universal apps.



### 4. Run the app



```bashCreate a `.env` file in the root directory:- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.

npx expo start

```- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



---```bash

cp .env.example .env

**Note**: This is a portfolio project demonstrating React Native development skills.````


Edit `.env` and add your Supabase credentials:

```properties
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key-here
`````

**Where to find these:**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 4. Set up Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  starting_odometer TEXT NOT NULL,
  start_timestamp TEXT NOT NULL,
  ending_odometer TEXT,
  end_timestamp TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trips_start_timestamp ON trips(start_timestamp DESC);
```

### 4. Run the app

```bash
npx expo start
```

Then:

- Press `a` to open on Android emulator
- Scan QR code with Expo Go app on your phone

## Building

### Development Build (Debug APK)

```bash
# Generate native Android project
npx expo prebuild --clean --platform android

# Build debug APK
cd android
./gradlew assembleDebug
cd ..

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Production Build (Release APK)

```bash
# Generate native Android project (if not done already)
npx expo prebuild --clean --platform android

# Build release APK
cd android
./gradlew assembleRelease
cd ..

# APK location:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS Build
eas build:configure

# Build preview APK
eas build -p android --profile preview

# Build production AAB (for Play Store)
eas build -p android --profile production
```

## Project Structure

```
tracker-v2/
├── src/
│   ├── app/                 # Expo Router screens
│   │   ├── (tabs)/         # Tab navigator screens
│   │   │   ├── index.tsx   # Dashboard
│   │   │   ├── Trips.tsx   # Trip history
│   │   │   └── _layout.tsx # Tab layout
│   │   ├── (screens)/      # Modal/stack screens
│   │   │   ├── StartTrip.tsx
│   │   │   ├── EndTrip.tsx
│   │   │   ├── Export.tsx
│   │   │   └── [tripID].tsx
│   │   └── _layout.tsx     # Root layout
│   ├── assets/             # Images and styles
│   │   ├── colors.ts
│   │   ├── Icons.tsx
│   │   └── images/
│   ├── components/         # Reusable components
│   │   └── AppButton.tsx
│   ├── context/            # React Context providers
│   │   └── TripContext.tsx
│   ├── data/               # Type definitions
│   │   └── tripdata.ts
│   └── functions/          # Business logic
│       ├── supabase.ts     # Supabase client
│       ├── tripService.ts  # Trip CRUD operations
│       ├── exportService.ts # Export functionality
│       └── Helpers.tsx     # Utility functions
├── android/                # Native Android code (generated)
├── ios/                    # Native iOS code (generated)
├── .env                    # Environment variables (not committed)
├── .env.example            # Environment variables template
├── app.json                # Expo configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

## Environment Variables

| Variable       | Description               | Example                     |
| -------------- | ------------------------- | --------------------------- |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon/public key  | `eyJhbGc...`                |

## Scripts

```bash
# Start development server
npm start

# Start with cache cleared
npm run start -- --clear

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Lint code
npm run lint

# Build Android APK locally
cd android && ./gradlew assembleRelease
```

## Features Roadmap

- [ ] User authentication
- [ ] Photo attachments for trips
- [ ] Custom date range picker for exports
- [ ] Trip categories/tags
- [ ] Fuel tracking
- [ ] Expense tracking
- [ ] Dark mode support
- [ ] iOS version
- [ ] Cloud backup

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

- Built with [Expo](https://expo.dev)
- Database by [Supabase](https://supabase.com)
- Icons from [@expo/vector-icons](https://icons.expo.fyi)

---
