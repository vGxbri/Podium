import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MemberAvatar } from "../../components/MemberAvatar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Colors } from "../../constants/Colors";
import { theme } from "../../constants/theme";
import { currentUser, mockGroups } from "../../data/mockData";

export default function ProfileScreen() {
  const totalGroups = mockGroups.length;
  const totalAwards = mockGroups.reduce((acc, g) => acc + g.awards.length, 0);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <MemberAvatar user={currentUser} size="lg" />
          <Text style={styles.userName}>{currentUser.name}</Text>
          <Text style={styles.userEmail}>
            {currentUser.email || "usuario@podium.app"}
          </Text>
        </View>

        {/* Stats */}
        <Card variant="elevated" padding="lg" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalGroups}</Text>
              <Text style={styles.statLabel}>Grupos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalAwards}</Text>
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
            <SettingsItem icon="🔔" title="Notificaciones" />
            <SettingsItem icon="🎨" title="Apariencia" />
            <SettingsItem icon="🔒" title="Privacidad" />
            <SettingsItem icon="❓" title="Ayuda" last />
          </Card>
        </View>

        {/* Logout */}
        <Button
          title="Cerrar Sesión"
          variant="secondary"
          onPress={() => {}}
          style={styles.logoutButton}
        />

        <Text style={styles.version}>Podium v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingsItemProps {
  icon: string;
  title: string;
  last?: boolean;
}

function SettingsItem({ icon, title, last }: SettingsItemProps) {
  return (
    <View style={[styles.settingsItem, !last && styles.settingsItemBorder]}>
      <Text style={styles.settingsIcon}>{icon}</Text>
      <Text style={styles.settingsTitle}>{title}</Text>
    </View>
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
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  settingsTitle: {
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
