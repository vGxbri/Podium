import { Stack } from "expo-router";
import { Colors } from "../../constants/Colors";

export default function JoinLayout() {
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
        name="[code]"
        options={{
          title: "Unirse a Grupo",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
