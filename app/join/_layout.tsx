import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

export default function JoinLayout() {
  const theme = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="[code]"
        options={{
          title: "Unirse a Grupo",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
