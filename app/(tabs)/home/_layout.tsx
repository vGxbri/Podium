import { Stack } from "expo-router";
import { Colors } from "../../../constants/Colors";

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: Colors.background,
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
    </Stack>
  );
}
