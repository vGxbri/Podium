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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      await signUp(email.trim(), password, displayName.trim());
      Alert.alert(
        "¡Registro exitoso!",
        "Por favor revisa tu email para confirmar tu cuenta.",
        [{ text: "OK", onPress: () => router.replace("/auth/login") }]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al registrarse";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    displayName.trim() && 
    email.trim() && 
    password.length >= 6 && 
    password === confirmPassword;

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
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Únete a Podium y empieza a premiar
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Nombre"
              placeholder="Tu nombre"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoComplete="name"
            />

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />

            <Input
              label="Confirmar Contraseña"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              error={confirmPassword && password !== confirmPassword ? "Las contraseñas no coinciden" : undefined}
            />

            <Button
              title="Crear Cuenta"
              onPress={handleRegister}
              loading={loading}
              disabled={!isFormValid}
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={styles.footerLink}> Inicia Sesión</Text>
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
    marginBottom: theme.spacing.xl,
  },
  logo: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: theme.spacing.xs,
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
