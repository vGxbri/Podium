import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Colors } from "../../constants/Colors";
import { theme } from "../../constants/theme";
import { useAuth } from "../../hooks";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Por favor ingresa email y contraseña");
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      // Navigate to root - index.tsx will redirect to tabs/home
      router.replace("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🏆</Text>
            <Text style={styles.title}>Podium</Text>
            <Text style={styles.subtitle}>
              Gestiona premios con tus amigos
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              disabled={!email.trim() || !password}
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text style={styles.footerLink}> Regístrate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl * 2,
  },
  logo: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  button: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
});
