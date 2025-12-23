import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import {
    ActivityIndicator,
    Button,
    Card,
    FAB,
    Surface,
    Text,
    useTheme
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GroupCard } from "../../../components/GroupCard";
import { theme as appTheme } from "../../../constants/theme";
import { useAuth, useGroups } from "../../../hooks";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { groups, isLoading, error, refetch } = useGroups();
  const theme = useTheme();

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ fontWeight: "700" }}>
            ¡Hola, {displayName}! 👋
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Gestiona tus grupos y premios
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: "700" }}>
              {totalGroups}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Grupos
            </Text>
          </Surface>
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: "700" }}>
              {totalAwards}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Premios
            </Text>
          </Surface>
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: "700" }}>
              {totalMembers}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Amigos
            </Text>
          </Surface>
        </View>

        {/* Error State */}
        {error && (
          <Card style={styles.errorCard} mode="outlined">
            <Card.Content style={styles.errorContent}>
              <Ionicons name="warning-outline" size={24} color={theme.colors.error} />
              <Text variant="bodyMedium" style={{ color: theme.colors.error, marginTop: 8 }}>
                Error al cargar grupos
              </Text>
              <Button mode="text" onPress={refetch} style={{ marginTop: 8 }}>
                Reintentar
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={{ fontWeight: "600" }}>
              Mis Grupos
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button mode="text" compact onPress={handleJoinGroup}>
                Unirse
              </Button>
              <Button mode="text" compact onPress={handleCreateGroup}>
                + Nuevo
              </Button>
            </View>
          </View>

          {isLoading && groups.length === 0 ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" />
              <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                Cargando grupos...
              </Text>
            </View>
          ) : groups.length === 0 ? (
            <Card style={styles.emptyCard} mode="elevated">
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="people-outline" size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleMedium" style={{ marginTop: 16 }}>
                  No tienes grupos aún
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, textAlign: "center" }}>
                  Crea tu primer grupo o únete a uno existente
                </Text>
                <View style={styles.emptyButtons}>
                  <Button mode="contained" onPress={handleCreateGroup}>
                    Crear Grupo
                  </Button>
                  <Button mode="outlined" onPress={handleJoinGroup}>
                    Unirse con código
                  </Button>
                </View>
              </Card.Content>
            </Card>
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
        <FAB
          icon="plus"
          style={[styles.fab, { bottom: 24 + insets.bottom }]}
          onPress={handleCreateGroup}
        />
      )}
    </View>
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
  header: {
    marginBottom: appTheme.spacing.lg,
    gap: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: appTheme.spacing.sm,
    marginBottom: appTheme.spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: appTheme.borderRadius.lg,
    padding: appTheme.spacing.md,
    alignItems: "center",
  },
  section: {
    marginBottom: appTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: appTheme.spacing.md,
  },
  loadingState: {
    alignItems: "center",
    padding: appTheme.spacing.xl,
  },
  errorCard: {
    marginBottom: appTheme.spacing.lg,
  },
  errorContent: {
    alignItems: "center",
  },
  emptyCard: {
    borderRadius: appTheme.borderRadius.lg,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: appTheme.spacing.xl,
  },
  emptyButtons: {
    flexDirection: "row",
    gap: appTheme.spacing.md,
    marginTop: appTheme.spacing.lg,
  },
  fab: {
    position: "absolute",
    right: 24,
  },
});

