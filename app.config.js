require("dotenv").config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

module.exports = {
  expo: {
    name: "ADAM | Bible AI",
    slug: "AdamChat",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/AppIcons/appstore.png",
    scheme: "adamchat",
    userInterfaceStyle: "light",
    backgroundColor: "#f4f5f0",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mediasperanta.adam",
      usesAppleSignIn: true,
      appleTeamId: "22F7AN6GC6",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: "com.mediasperanta.adam",
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
      "expo-apple-authentication",
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
        projectId: "e6799d0a-bdf1-49ce-9685-7ee1f5e1c4e3",
      },
    },
  },
};
