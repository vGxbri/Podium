import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
} from "react-native";
import {
    Button,
    Surface,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme as appTheme } from "../../../../constants/theme";

export default function JoinGroupScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [code, setCode] = useState("");

  const handleJoin = () => {
    if (code.trim()) {
      router.push({
        pathname: "/join/[code]",
        params: { code: code.trim().toUpperCase() }
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          {/* Icon */}
          <Surface style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
            <Ionicons name="ticket-outline" size={48} color={theme.colors.primary} />
          </Surface>

          {/* Title */}
          <Text variant="headlineSmall" style={{ fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
            Unirse a un grupo
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", marginBottom: 32, maxWidth: 280 }}>
            Introduce el código de invitación que te han compartido
          </Text>

          {/* Code Input */}
          <TextInput
            placeholder="Ej: ABC12345"
            value={code}
            onChangeText={(text: string) => setCode(text.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={12}
            mode="outlined"
            style={styles.input}
            contentStyle={{ textAlign: "center", letterSpacing: 2 }}
          />

          {/* Join Button */}
          <Button
            mode="contained"
            onPress={handleJoin}
            disabled={!code.trim()}
            icon="login"
            style={styles.button}
          >
            Unirse al grupo
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: appTheme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: appTheme.spacing.lg,
  },
  input: {
    width: "100%",
    maxWidth: 300,
  },
  button: {
    width: "100%",
    maxWidth: 300,
    marginTop: appTheme.spacing.lg,
  },
});
