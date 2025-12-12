import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GroupCard } from "../../../components/GroupCard";
import { Colors } from "../../../constants/Colors";
import { theme } from "../../../constants/theme";
import { mockGroups } from "../../../data/mockData";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGroupPress = (groupId: string) => {
    router.push(`/home/group/${groupId}`);
  };

  const handleCreateGroup = () => {
    router.push("/home/group/create");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 100 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>¡Bienvenido! 👋</Text>
          <Text style={styles.subtitle}>
            Gestiona tus grupos y premios
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockGroups.length}</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {mockGroups.reduce((acc, g) => acc + g.awards.length, 0)}
            </Text>
            <Text style={styles.statLabel}>Premios</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {mockGroups.reduce((acc, g) => acc + g.memberCount, 0)}
            </Text>
            <Text style={styles.statLabel}>Amigos</Text>
          </View>
        </View>

        {/* Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Grupos</Text>
            <TouchableOpacity onPress={handleCreateGroup}>
              <Text style={styles.sectionAction}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {mockGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No tienes grupos aún</Text>
              <Text style={styles.emptySubtext}>
                Crea tu primer grupo para empezar
              </Text>
            </View>
          ) : (
            mockGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onPress={() => handleGroupPress(group.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 24 + insets.bottom }]}
        onPress={handleCreateGroup}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.textOnPrimary} />
      </TouchableOpacity>
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  sectionAction: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    padding: theme.spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.lg,
  },
});
