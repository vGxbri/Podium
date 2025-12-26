import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

export default function AuthLayout() {
  const theme = useTheme();
  
  return (
    <Stack
      screenOptions={{
        animation: "fade", // Fade transition between auth screens
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "",
          headerShown: false, // Hide header for consistency
        }}
      />
    </Stack>
  );
}
