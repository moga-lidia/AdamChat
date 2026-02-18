require("dotenv").config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

module.exports = {
  expo: {
    name: "AdamChat",
    slug: "AdamChat",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/AppIcons/appstore.png",
    scheme: "adamchat",
    userInterfaceStyle: "light",
    backgroundColor: "#f4f5f0",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.lidiaszm.adamchat",
    },
    android: {
      package: "com.lidiaszm.adamchat",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/AppIcons/playstore.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/AppIcons/playstore.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.jpg",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#f4f5f0",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      googleClientId: GOOGLE_CLIENT_ID,
      eas: {
        projectId: "a5eeec83-811f-4e49-851a-cdbd288b205f",
      },
    },
  },
};
