import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Button, HelperText, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme as appTheme } from "../../constants/theme";
import { useAuth } from "../../hooks";

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
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

  const passwordsDoNotMatch = confirmPassword && password !== confirmPassword;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
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
            <Text variant="headlineMedium" style={{ fontWeight: "700" }}>
              Crear Cuenta
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, textAlign: "center" }}>
              Únete a Podium y empieza a premiar
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Nombre"
              placeholder="Tu nombre"
              value={displayName}
              onChangeText={setDisplayName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Confirmar Contraseña"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              error={!!passwordsDoNotMatch}
              style={styles.input}
            />
            {passwordsDoNotMatch && (
              <HelperText type="error" visible>
                Las contraseñas no coinciden
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={!isFormValid}
              style={styles.button}
            >
              Crear Cuenta
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              ¿Ya tienes cuenta?
            </Text>
            <Button mode="text" compact onPress={() => router.push("/auth/login")}>
              Inicia Sesión
            </Button>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: appTheme.spacing.lg,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: appTheme.spacing.xl,
  },
  logo: {
    fontSize: 48,
    marginBottom: appTheme.spacing.sm,
  },
  form: {
    marginBottom: appTheme.spacing.xl,
  },
  input: {
    marginBottom: appTheme.spacing.sm,
  },
  button: {
    marginTop: appTheme.spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
