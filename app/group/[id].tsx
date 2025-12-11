import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AwardCard } from "../../components/AwardCard";
import { InviteModal } from "../../components/InviteModal";
import { MemberAvatarsRow } from "../../components/MemberAvatar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Colors } from "../../constants/Colors";
import { theme } from "../../constants/theme";
import { getGroupById } from "../../data/mockData";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const group = getGroupById(id || "");

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Grupo no encontrado</Text>
          <Button title="Volver" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const isAdmin = group.members.some(
    (m) => m.userId === "1" && m.role === "admin"
  );

  const handleCreateAward = () => {
    router.push(`/award/create?groupId=${group.id}`);
  };

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: group.name,
          headerRight: () =>
            isAdmin ? (
              <TouchableOpacity>
                <Ionicons name="settings-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
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
                  {isAdmin && (
                    <View style={styles.adminBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={Colors.primary} />
                      <Text style={styles.adminText}>Admin</Text>
                    </View>
                  )}
                  <Text style={styles.memberCount}>
                    {group.memberCount} miembros
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
              <MemberAvatarsRow
                users={group.members.map((m) => m.user)}
                max={6}
                size="md"
              />
            </Card>
          </View>

          {/* Awards Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Premios</Text>
              <Text style={styles.awardCount}>{group.awards.length}</Text>
            </View>

            {group.awards.length === 0 ? (
              <Card variant="glass" padding="lg">
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🏆</Text>
                  <Text style={styles.emptyText}>No hay premios aún</Text>
                  <Text style={styles.emptySubtext}>
                    {isAdmin
                      ? "Crea el primer premio para este grupo"
                      : "El administrador aún no ha creado premios"}
                  </Text>
                </View>
              </Card>
            ) : (
              group.awards.map((award) => (
                <AwardCard key={award.id} award={award} />
              ))
            )}
          </View>
        </ScrollView>

        {/* FAB for admins */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.fab}
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
          inviteCode={group.inviteCode}
          groupName={group.name}
        />
      </SafeAreaView>
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
    paddingBottom: 100,
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
    marginBottom: theme.spacing.lg,
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
  adminText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
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
  fab: {
    position: "absolute",
    bottom: 24,
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
