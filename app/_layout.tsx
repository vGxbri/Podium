import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/Colors";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="group/create"
          options={{
            title: "Crear Grupo",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="group/[id]"
          options={{
            title: "Grupo",
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
    </>
  );
}
