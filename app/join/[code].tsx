import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Colors } from "../../constants/Colors";
import { theme } from "../../constants/theme";
import { useAuth } from "../../hooks";
import { groupsService } from "../../services";
import { Group } from "../../types/database";

type JoinState = "loading" | "preview" | "joining" | "success" | "error" | "already_member";

export default function JoinGroupScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
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

  // Load group info when screen opens
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
      // Redirect to login, then back to this screen
      Alert.alert(
        "Inicia sesión",
        "Necesitas iniciar sesión para unirte a un grupo",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Iniciar Sesión", 
            onPress: () => router.push("/auth/login")
          }
        ]
      );
      return;
    }

    try {
      setState("joining");
      const joinedGroup = await groupsService.joinGroup(code!);
      setState("success");
      
      // Wait a moment to show success, then navigate to group
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
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando invitación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={64} color={Colors.error} />
          </View>
          <Text style={styles.title}>Enlace no válido</Text>
          <Text style={styles.subtitle}>{error}</Text>
          <Button 
            title="Ir al inicio" 
            onPress={handleGoHome}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Already member state
  if (state === "already_member") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={[styles.iconContainer, styles.infoIcon]}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.title}>¡Ya eres miembro!</Text>
          <Text style={styles.subtitle}>
            Ya formas parte de {`"${group?.name}"`}
          </Text>
          <Button 
            title="Ir al grupo" 
            onPress={handleGoToGroup}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  if (state === "success") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={[styles.iconContainer, styles.successIcon]}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
          </View>
          <Text style={styles.title}>¡Bienvenido!</Text>
          <Text style={styles.subtitle}>
            Te has unido a {`"${group?.name}"`}
          </Text>
          <ActivityIndicator 
            size="small" 
            color={Colors.primary} 
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Joining state
  if (state === "joining") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Uniéndote al grupo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Preview state (default)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card variant="elevated" padding="lg" style={styles.card}>
          {/* Group Icon */}
          <View style={styles.groupIconContainer}>
            <Text style={styles.groupIcon}>{group?.icon || "🏆"}</Text>
          </View>

          {/* Group Info */}
          <Text style={styles.inviteLabel}>Te han invitado a unirte a</Text>
          <Text style={styles.groupName}>{group?.name}</Text>
          
          {group?.description && (
            <Text style={styles.groupDescription}>{group.description}</Text>
          )}

          {/* Join Button */}
          <Button
            title={isAuthenticated ? "Unirme al grupo" : "Iniciar sesión para unirme"}
            onPress={handleJoin}
            style={styles.joinButton}
            icon={<Ionicons name="people" size={20} color={Colors.textOnPrimary} />}
          />

          {/* Cancel */}
          <Button
            title="Cancelar"
            variant="secondary"
            onPress={handleGoHome}
            style={styles.cancelButton}
          />
        </Card>

        {/* Code display */}
        <Text style={styles.codeText}>
          Código: {code}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.errorLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  successIcon: {
    backgroundColor: Colors.successLight,
  },
  infoIcon: {
    backgroundColor: Colors.backgroundLight,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
  },
  button: {
    marginTop: theme.spacing.xl,
    minWidth: 200,
  },
  card: {
    alignItems: "center",
  },
  groupIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  groupIcon: {
    fontSize: 40,
  },
  inviteLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    maxWidth: 280,
  },
  joinButton: {
    width: "100%",
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    width: "100%",
    marginTop: theme.spacing.sm,
  },
  codeText: {
    marginTop: theme.spacing.lg,
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
  },
});
