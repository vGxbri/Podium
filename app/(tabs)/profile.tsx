import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    Divider,
    List,
    Surface,

    Text,
    useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MemberAvatar } from "../../components/MemberAvatar";
import { theme as appTheme } from "../../constants/theme";
import { useAuth, useGroups } from "../../hooks";

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { profile, isLoading: authLoading, signOut, isAuthenticated } = useAuth();
  const { groups, isLoading: groupsLoading } = useGroups();

  const totalGroups = groups.length;
  const totalAwards = groups.reduce((acc, g) => acc + (g.awards?.length || 0), 0);

  const handleSignOut = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Cerrar Sesión", 
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/auth/login");
            } catch {
              Alert.alert("Error", "No se pudo cerrar sesión");
            }
          }
        },
      ]
    );
  };

  // Loading state
  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["left", "right"]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Not authenticated state
  if (!isAuthenticated || !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["left", "right"]}>
        <View style={styles.centerContent}>
          <Ionicons name="person-circle-outline" size={80} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleLarge" style={{ marginTop: 16 }}>
            No has iniciado sesión
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, marginBottom: 24 }}>
            Inicia sesión para ver tu perfil
          </Text>
          <Button mode="contained" onPress={() => router.push("/auth/login")}>
            Iniciar Sesión
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <MemberAvatar user={profile} size="lg" />
          <Text variant="headlineSmall" style={{ fontWeight: "700", marginTop: 12 }}>
            {profile.display_name}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {profile.email || "usuario@podium.app"}
          </Text>
          {profile.bio && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: "center", maxWidth: 280 }}>
              {profile.bio}
            </Text>
          )}
        </View>

        {/* Stats */}
        <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              {groupsLoading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: "700" }}>
                  {totalGroups}
                </Text>
              )}
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Grupos
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.outline }]} />
            <View style={styles.stat}>
              {groupsLoading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: "700" }}>
                  {totalAwards}
                </Text>
              )}
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Premios
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.outline }]} />
            <View style={styles.stat}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: "700" }}>
                0
              </Text>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Ganados
              </Text>
            </View>
          </View>
        </Surface>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={{ fontWeight: "600", marginBottom: 12 }}>
            Configuración
          </Text>

          <Card mode="outlined">
            <List.Item
              title="Notificaciones"
              left={(props) => <List.Icon {...props} icon="bell-outline" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Apariencia"
              left={(props) => <List.Icon {...props} icon="palette-outline" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Privacidad"
              left={(props) => <List.Icon {...props} icon="lock-outline" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Ayuda"
              left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Logout */}
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.logoutButton}
          textColor={theme.colors.error}
        >
          Cerrar Sesión
        </Button>

        <Text variant="labelSmall" style={{ textAlign: "center", color: theme.colors.onSurfaceVariant }}>
          Podium v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: appTheme.spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: appTheme.spacing.lg,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: appTheme.spacing.xl,
  },
  statsCard: {
    borderRadius: appTheme.borderRadius.lg,
    padding: appTheme.spacing.lg,
    marginBottom: appTheme.spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  section: {
    marginBottom: appTheme.spacing.xl,
  },
  logoutButton: {
    marginBottom: appTheme.spacing.lg,
  },
});

