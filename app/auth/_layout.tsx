import { Stack } from "expo-router";
import { Colors } from "../../constants/Colors";

export default function AuthLayout() {
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
        headerShadowVisible: false,
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
          title: "Registro",
          headerBackTitle: "Volver",
        }}
      />
    </Stack>
  );
}
