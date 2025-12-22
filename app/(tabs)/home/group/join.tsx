import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Colors } from "../../../../constants/Colors";
import { theme } from "../../../../constants/theme";

export default function JoinGroupScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="ticket-outline" size={48} color={Colors.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Unirse a un grupo</Text>
          <Text style={styles.subtitle}>
            Introduce el código de invitación que te han compartido
          </Text>

          {/* Code Input */}
          <Input
            placeholder="Ej: ABC12345"
            value={code}
            onChangeText={(text: string) => setCode(text.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={12}
            style={styles.input}
          />

          {/* Join Button */}
          <Button
            title="Unirse al grupo"
            onPress={handleJoin}
            disabled={!code.trim()}
            style={styles.button}
            icon={<Ionicons name="enter-outline" size={20} color={Colors.textOnPrimary} />}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    maxWidth: 280,
  },
  input: {
    width: "100%",
    maxWidth: 300,
    textAlign: "center",
    fontSize: 18,
    letterSpacing: 2,
  },
  button: {
    width: "100%",
    maxWidth: 300,
    marginTop: theme.spacing.lg,
  },
});
