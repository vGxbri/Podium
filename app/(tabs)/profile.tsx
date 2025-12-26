import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  List,
  Text,
  useTheme
} from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MemberAvatar } from "../../components/MemberAvatar";
import { useSnackbar } from "../../components/ui/SnackbarContext";
import { theme as appTheme } from "../../constants/theme";
import { useAuth, useGroups } from "../../hooks";

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, isLoading: authLoading, signOut, isAuthenticated } = useAuth();
  const { groups, isLoading: groupsLoading } = useGroups();
  const { showSnackbar } = useSnackbar();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const totalGroups = groups.length;
  const totalAwards = groups.reduce((acc, g) => acc + (g.awards?.length || 0), 0);

  const handleSignOut = async () => {
    setShowLogoutDialog(true);
  };

  const confirmSignOut = async () => {
    try {
      await signOut();
      router.replace("/auth/login");
    } catch {
      showSnackbar("No se pudo cerrar sesión", "error");
    }
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
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 50, paddingBottom: 100 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
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

        {/* Settings Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={{ fontWeight: "600", marginBottom: 12 }}>
            Configuración
          </Text>

          <Card mode="outlined" style={{ borderColor: theme.colors.secondaryContainer, borderWidth: 1 }}>
            <List.Item
              title="Notificaciones"
              left={() => (
                <View style={{ marginLeft: 16, marginRight: 8 }}>
                  <View style={{ 
                    backgroundColor: theme.colors.primaryContainer, 
                    borderColor: theme.colors.primary, 
                    borderWidth: 1,
                    borderRadius: 8,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Ionicons name="notifications-outline" size={22} color={theme.colors.onSurface} />
                  </View>
                </View>
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Apariencia"
              left={() => (
                <View style={{ marginLeft: 16, marginRight: 8 }}>
                  <View style={{ 
                    backgroundColor: theme.colors.primaryContainer, 
                    borderColor: theme.colors.primary, 
                    borderWidth: 1,
                    borderRadius: 8,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Ionicons name="color-palette-outline" size={22} color={theme.colors.onSurface} />
                  </View>
                </View>
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Privacidad"
              left={() => (
                <View style={{ marginLeft: 16, marginRight: 8 }}>
                  <View style={{ 
                    backgroundColor: theme.colors.primaryContainer, 
                    borderColor: theme.colors.primary, 
                    borderWidth: 1,
                    borderRadius: 8,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Ionicons name="lock-closed-outline" size={22} color={theme.colors.onSurface} />
                  </View>
                </View>
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Ayuda"
              left={() => (
                <View style={{ marginLeft: 16, marginRight: 8 }}>
                  <View style={{ 
                    backgroundColor: theme.colors.primaryContainer, 
                    borderColor: theme.colors.primary, 
                    borderWidth: 1,
                    borderRadius: 8,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Ionicons name="help-circle-outline" size={22} color={theme.colors.onSurface} />
                  </View>
                </View>
              )}
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

      <ConfirmDialog
        visible={showLogoutDialog}
        title="Cerrar Sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        type="error"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        onConfirm={confirmSignOut}
        onCancel={() => setShowLogoutDialog(false)}
      />
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

