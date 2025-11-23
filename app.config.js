module.exports = {
  expo: {
    name: "Tracker",
    slug: "tracker-v2",
    version: "1.0.1",
    orientation: "portrait",
    scheme: "trackerv2",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.trackerv2",
    },
    android: {
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.anonymous.trackerv2",
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/logo.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      output: "static",
      favicon: "./src/assets/images/logo.png",
    },
    plugins: ["expo-router"],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    splash: {
      image: "./src/assets/images/logo.png",
      backgroundColor: "#ffffff",
      resizeMode: "contain",
    },
    extra: {
      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      supabaseKey:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY,
      eas: {
        projectId: "your-project-id", // Optional, for EAS builds
      },
    },
  },
};
