import { Stack } from "expo-router/stack";
import * as AC from "@bacons/apple-colors";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

const AppleStackPreset: NativeStackNavigationOptions =
  process.env.EXPO_OS !== "ios"
    ? {}
    : isLiquidGlassAvailable()
    ? {
        // iOS 26 + liquid glass
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: {
          backgroundColor: "transparent",
        },
        headerTitleStyle: {
          color: AC.label as any,
        },
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }
    : {
        headerTransparent: true,
        headerShadowVisible: true,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: {
          backgroundColor: "transparent",
        },
        headerBlurEffect: "systemChromeMaterial",
        headerBackButtonDisplayMode: "default",
      };

export default function RSSLayout() {
  return (
    <Stack screenOptions={AppleStackPreset}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false // Hide header for the main RSS feed since tabs handle the title
        }}
      />
      <Stack.Screen
        name="article/[id]"
        options={{
          title: "Article",
          headerShown: true
        }}
      />
    </Stack>
  );
}