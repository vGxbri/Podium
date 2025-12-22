import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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
import { AwardCard } from "../../../../components/AwardCard";
import { InviteModal } from "../../../../components/InviteModal";
import { MemberAvatarsRow } from "../../../../components/MemberAvatar";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { Colors } from "../../../../constants/Colors";
import { theme } from "../../../../constants/theme";
import { useGroup } from "../../../../hooks";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { 
    group, 
    isLoading, 
    error, 
    refetch, 
    isAdmin, 
    isOwner 
  } = useGroup(id);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleCreateAward = () => {
    router.push({
      pathname: "/home/award/create",
      params: { groupId: id }
    });
  };

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  // Loading state
  if (isLoading && !group) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando grupo...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error || !group) {
    return (
      <View style={styles.container}>
        <View style={styles.notFound}>
          <Ionicons name="warning-outline" size={48} color={Colors.textLight} />
          <Text style={styles.notFoundText}>
            {error ? "Error al cargar el grupo" : "Grupo no encontrado"}
          </Text>
          <Button title="Volver" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: group.name,
          headerRight: () =>
            isAdmin ? (
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push({
                  pathname: "/home/group/settings",
                  params: { id }
                })}
              >
                <Ionicons name="settings-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
            ) : null,
        }}
      />

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
          {/* Group Header */}
          <Card variant="elevated" padding="lg" style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View style={styles.groupIcon}>
                <Text style={styles.groupIconText}>{group.icon || "🏆"}</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                {group.description && (
                  <Text style={styles.groupDescription}>{group.description}</Text>
                )}
                <View style={styles.badgeRow}>
                  {isOwner && (
                    <View style={[styles.adminBadge, styles.ownerBadge]}>
                      <Ionicons name="star" size={12} color={Colors.gold} />
                      <Text style={styles.ownerText}>Creador</Text>
                    </View>
                  )}
                  {isAdmin && !isOwner && (
                    <View style={styles.adminBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={Colors.primary} />
                      <Text style={styles.adminText}>Admin</Text>
                    </View>
                  )}
                  <Text style={styles.memberCount}>
                    {group.member_count} miembros
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Members Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Miembros</Text>
              <TouchableOpacity onPress={handleInvite}>
                <View style={styles.inviteButton}>
                  <Ionicons name="person-add" size={16} color={Colors.primary} />
                  <Text style={styles.inviteText}>Invitar</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Card variant="glass" padding="md">
              {group.members.length > 0 ? (
                <MemberAvatarsRow
                  users={group.members}
                  max={6}
                  size="md"
                />
              ) : (
                <Text style={styles.noMembersText}>No hay miembros aún</Text>
              )}
            </Card>
          </View>

          {/* Awards Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Premios</Text>
              <Text style={styles.awardCount}>{group.awards?.length || 0}</Text>
            </View>

            {!group.awards || group.awards.length === 0 ? (
              <Card variant="glass" padding="lg">
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🏆</Text>
                  <Text style={styles.emptyText}>No hay premios aún</Text>
                  <Text style={styles.emptySubtext}>
                    {isAdmin
                      ? "Crea el primer premio para este grupo"
                      : "El administrador aún no ha creado premios"}
                  </Text>
                  {isAdmin && (
                    <TouchableOpacity 
                      style={styles.createAwardButton}
                      onPress={handleCreateAward}
                    >
                      <Text style={styles.createAwardText}>+ Crear Premio</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ) : (
              group.awards.map((award) => (
                <AwardCard 
                  key={award.id} 
                  award={award}
                  onPress={() => {
                    router.push({
                      pathname: "/home/award/[id]",
                      params: { id: award.id, groupId: id }
                    });
                  }}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* FAB for admins */}
        {isAdmin && group.awards && group.awards.length > 0 && (
          <TouchableOpacity
            style={[styles.fab, { bottom: 24 + insets.bottom }]}
            onPress={handleCreateAward}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color={Colors.textOnPrimary} />
          </TouchableOpacity>
        )}

        {/* Invite Modal */}
        <InviteModal
          visible={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          inviteCode={group.invite_code}
          groupName={group.name}
        />
      </View>
    </>
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
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: Colors.textSecondary,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginVertical: theme.spacing.lg,
  },
  headerButton: {
    padding: 8,
  },
  headerCard: {
    marginBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  groupIconText: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  ownerBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  adminText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  ownerText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gold,
  },
  memberCount: {
    fontSize: 13,
    color: Colors.textSecondary,
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
  awardCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inviteText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary,
  },
  noMembersText: {
    color: Colors.textSecondary,
    textAlign: "center",
    padding: theme.spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  createAwardButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  createAwardText: {
    color: Colors.textOnPrimary,
    fontWeight: "600",
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
