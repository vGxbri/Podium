import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MemberAvatar } from "../../components/MemberAvatar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Colors } from "../../constants/Colors";
import { theme } from "../../constants/theme";
import { useAuth, useGroups } from "../../hooks";

export default function ProfileScreen() {
  const router = useRouter();
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
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Not authenticated state
  if (!isAuthenticated || !profile) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <View style={styles.centerContent}>
          <Ionicons name="person-circle-outline" size={80} color={Colors.textLight} />
          <Text style={styles.notAuthTitle}>No has iniciado sesión</Text>
          <Text style={styles.notAuthSubtitle}>
            Inicia sesión para ver tu perfil
          </Text>
          <Button 
            title="Iniciar Sesión" 
            onPress={() => router.push("/auth/login")} 
            style={styles.authButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <MemberAvatar user={profile} size="lg" />
          <Text style={styles.userName}>{profile.display_name}</Text>
          <Text style={styles.userEmail}>
            {profile.email || "usuario@podium.app"}
          </Text>
          {profile.bio && (
            <Text style={styles.userBio}>{profile.bio}</Text>
          )}
        </View>

        {/* Stats */}
        <Card variant="elevated" padding="lg" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              {groupsLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.statValue}>{totalGroups}</Text>
              )}
              <Text style={styles.statLabel}>Grupos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              {groupsLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.statValue}>{totalAwards}</Text>
              )}
              <Text style={styles.statLabel}>Premios</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Ganados</Text>
            </View>
          </View>
        </Card>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>

          <Card variant="default" padding="none">
            <SettingsItem 
              icon="notifications-outline" 
              title="Notificaciones" 
              onPress={() => {}} 
            />
            <SettingsItem 
              icon="color-palette-outline" 
              title="Apariencia" 
              onPress={() => {}} 
            />
            <SettingsItem 
              icon="lock-closed-outline" 
              title="Privacidad" 
              onPress={() => {}} 
            />
            <SettingsItem 
              icon="help-circle-outline" 
              title="Ayuda" 
              onPress={() => {}} 
              last 
            />
          </Card>
        </View>

        {/* Logout */}
        <Button
          title="Cerrar Sesión"
          variant="secondary"
          onPress={handleSignOut}
          style={styles.logoutButton}
        />

        <Text style={styles.version}>Podium v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  last?: boolean;
}

function SettingsItem({ icon, title, onPress, last }: SettingsItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.settingsItem, !last && styles.settingsItemBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={22} color={Colors.textSecondary} style={styles.settingsIcon} />
      <Text style={styles.settingsTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  notAuthTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    marginTop: theme.spacing.lg,
  },
  notAuthSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: theme.spacing.lg,
  },
  authButton: {
    minWidth: 200,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginTop: theme.spacing.md,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  userBio: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    maxWidth: 280,
  },
  statsCard: {
    marginBottom: theme.spacing.xl,
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
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: theme.spacing.md,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingsIcon: {
    marginRight: theme.spacing.md,
  },
  settingsTitle: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  logoutButton: {
    marginBottom: theme.spacing.lg,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textLight,
  },
});
