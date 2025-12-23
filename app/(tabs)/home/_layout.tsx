import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

export default function HomeStackLayout() {
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
        name="index"
        options={{
          headerTitle: "Podium",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 24,
          },
        }}
      />
      <Stack.Screen
        name="group/[id]"
        options={{
          title: "Grupo",
        }}
      />
      <Stack.Screen
        name="group/create"
        options={{
          title: "Crear Grupo",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="award/create"
        options={{
          title: "Crear Premio",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="group/join"
        options={{
          title: "Unirse a grupo",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
