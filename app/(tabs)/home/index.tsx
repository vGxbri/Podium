import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GroupCard } from "../../../components/GroupCard";
import { Colors } from "../../../constants/Colors";
import { theme } from "../../../constants/theme";
import { useAuth, useGroups } from "../../../hooks";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { groups, isLoading, error, refetch } = useGroups();

  const handleGroupPress = (groupId: string) => {
    router.push({
      pathname: "/home/group/[id]",
      params: { id: groupId }
    });
  };

  const handleCreateGroup = () => {
    router.push("/home/group/create" as any);
  };

  const handleJoinGroup = () => {
    router.push("/home/group/join" as any);
  };

  // Calculate stats
  const totalGroups = groups.length;
  const totalAwards = groups.reduce((acc, g) => acc + (g.awards?.length || 0), 0);
  const totalMembers = groups.reduce((acc, g) => acc + (g.member_count || 0), 0);

  const displayName = profile?.display_name?.split(' ')[0] || 'Usuario';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 100 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>¡Hola, {displayName}! 👋</Text>
          <Text style={styles.subtitle}>
            Gestiona tus grupos y premios
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalGroups}</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalAwards}</Text>
            <Text style={styles.statLabel}>Premios</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalMembers}</Text>
            <Text style={styles.statLabel}>Amigos</Text>
          </View>
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorState}>
            <Ionicons name="warning-outline" size={24} color={Colors.error} />
            <Text style={styles.errorText}>Error al cargar grupos</Text>
            <TouchableOpacity onPress={refetch}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Grupos</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={handleJoinGroup}>
                <Text style={styles.sectionAction}>Unirse</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateGroup}>
                <Text style={styles.sectionAction}>+ Nuevo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoading && groups.length === 0 ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Cargando grupos...</Text>
            </View>
          ) : groups.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No tienes grupos aún</Text>
              <Text style={styles.emptySubtext}>
                Crea tu primer grupo o únete a uno existente
              </Text>
              <View style={styles.emptyButtons}>
                <TouchableOpacity 
                  style={styles.createButton} 
                  onPress={handleCreateGroup}
                >
                  <Text style={styles.createButtonText}>Crear Grupo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.createButton, styles.joinButton]} 
                  onPress={handleJoinGroup}
                >
                  <Text style={[styles.createButtonText, styles.joinButtonText]}>Unirse con código</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            groups.map((group) => (
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
      {groups.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { bottom: 24 + insets.bottom }]}
          onPress={handleCreateGroup}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={Colors.textOnPrimary} />
        </TouchableOpacity>
      )}
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
    fontWeight: "600",
  },
  loadingState: {
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: Colors.textSecondary,
  },
  errorState: {
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    marginTop: theme.spacing.sm,
    color: Colors.error,
  },
  retryText: {
    marginTop: theme.spacing.sm,
    color: Colors.primary,
    fontWeight: "600",
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
    marginBottom: theme.spacing.lg,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  createButtonText: {
    color: Colors.textOnPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  emptyButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  joinButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  joinButtonText: {
    color: Colors.primary,
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
