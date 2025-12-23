import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    View,
} from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Surface,
    Text,
    useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme as appTheme } from "../../constants/theme";
import { useAuth } from "../../hooks";
import { groupsService } from "../../services";
import { Group } from "../../types/database";

type JoinState = "loading" | "preview" | "joining" | "success" | "error" | "already_member";

export default function JoinGroupScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [state, setState] = useState<JoinState>("loading");
  const [group, setGroup] = useState<Group | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadGroupPreview = useCallback(async () => {
    try {
      setState("loading");
      const groupData = await groupsService.getGroupByInviteCode(code!);
      
      if (!groupData) {
        setError("Este enlace de invitación no es válido o ha expirado");
        setState("error");
        return;
      }
      
      setGroup(groupData);
      setState("preview");
    } catch (err) {
      console.error("Error loading group preview:", err);
      setError("Error al cargar la información del grupo");
      setState("error");
    }
  }, [code]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!code) {
      setError("Código de invitación no válido");
      setState("error");
      return;
    }

    loadGroupPreview();
  }, [code, authLoading, loadGroupPreview]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Inicia sesión",
        "Necesitas iniciar sesión para unirte a un grupo",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar Sesión", onPress: () => router.push("/auth/login") }
        ]
      );
      return;
    }

    try {
      setState("joining");
      const joinedGroup = await groupsService.joinGroup(code!);
      setState("success");
      
      setTimeout(() => {
        router.replace({
          pathname: "/home/group/[id]",
          params: { id: joinedGroup.id }
        });
      }, 1500);
    } catch (err) {
      console.error("Error joining group:", err);
      const message = err instanceof Error ? err.message : "Error al unirse al grupo";
      
      if (message.includes("already a member")) {
        setState("already_member");
      } else {
        setError(message);
        setState("error");
      }
    }
  };

  const handleGoToGroup = () => {
    if (group) {
      router.replace({
        pathname: "/home/group/[id]",
        params: { id: group.id }
      });
    }
  };

  const handleGoHome = () => {
    router.replace("/");
  };

  // Loading state
  if (state === "loading" || authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Cargando invitación...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <Surface style={[styles.iconContainer, { backgroundColor: theme.colors.errorContainer }]} elevation={0}>
            <Ionicons name="warning-outline" size={64} color={theme.colors.error} />
          </Surface>
          <Text variant="headlineSmall" style={{ fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
            Enlace no válido
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", maxWidth: 280 }}>
            {error}
          </Text>
          <Button mode="contained" onPress={handleGoHome} style={styles.button}>
            Ir al inicio
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Already member state
  if (state === "already_member") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <Surface style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
            <Ionicons name="checkmark-circle" size={64} color={theme.colors.primary} />
          </Surface>
          <Text variant="headlineSmall" style={{ fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
            ¡Ya eres miembro!
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
            Ya formas parte de "{group?.name}"
          </Text>
          <Button mode="contained" onPress={handleGoToGroup} style={styles.button}>
            Ir al grupo
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  if (state === "success") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <Surface style={[styles.iconContainer, { backgroundColor: 'rgba(50, 215, 75, 0.15)' }]} elevation={0}>
            <Ionicons name="checkmark-circle" size={64} color="#32D74B" />
          </Surface>
          <Text variant="headlineSmall" style={{ fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
            ¡Bienvenido!
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
            Te has unido a "{group?.name}"
          </Text>
          <ActivityIndicator size="small" style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  // Joining state
  if (state === "joining") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Uniéndote al grupo...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Preview state (default)
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card mode="elevated" style={styles.card}>
          <Card.Content style={{ alignItems: "center" }}>
            {/* Group Icon */}
            <Surface style={[styles.groupIconContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
              {getIconComponent((group?.icon as IconName) || defaultGroupIcon, 40, theme.colors.primary)}
            </Surface>

            {/* Group Info */}
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Te han invitado a unirte a
            </Text>
            <Text variant="headlineSmall" style={{ fontWeight: "700", textAlign: "center", marginVertical: 8 }}>
              {group?.name}
            </Text>
            
            {group?.description && (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", marginBottom: 16, maxWidth: 280 }}>
                {group.description}
              </Text>
            )}

            {/* Join Button */}
            <Button
              mode="contained"
              onPress={handleJoin}
              icon="account-multiple-plus"
              style={{ width: "100%", marginTop: 8 }}
            >
              {isAuthenticated ? "Unirme al grupo" : "Iniciar sesión para unirme"}
            </Button>

            {/* Cancel */}
            <Button
              mode="outlined"
              onPress={handleGoHome}
              style={{ width: "100%", marginTop: 8 }}
            >
              Cancelar
            </Button>
          </Card.Content>
        </Card>

        {/* Code display */}
        <Text variant="labelSmall" style={{ marginTop: 16, textAlign: "center", color: theme.colors.onSurfaceVariant }}>
          Código: {code}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: appTheme.spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: appTheme.spacing.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: appTheme.spacing.lg,
  },
  button: {
    marginTop: appTheme.spacing.xl,
    minWidth: 200,
  },
  card: {
    alignItems: "center",
  },
  groupIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: appTheme.spacing.lg,
  },
  groupIcon: {
    fontSize: 40,
  },
});
