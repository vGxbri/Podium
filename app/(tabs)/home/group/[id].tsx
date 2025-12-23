import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  FAB,
  Surface,
  Text,
  useTheme
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AwardCard } from "../../../../components/AwardCard";
import { InviteModal } from "../../../../components/InviteModal";
import { MemberAvatar } from "../../../../components/MemberAvatar";
import { theme as appTheme } from "../../../../constants/theme";
import { useGroup } from "../../../../hooks";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { 
    group, 
    isLoading, 
    error, 
    refetch, 
    removeMember,
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Cargando grupo...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error || !group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.notFound}>
          <Ionicons name="warning-outline" size={48} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyLarge" style={{ marginVertical: 16, color: theme.colors.onSurfaceVariant }}>
            {error ? "Error al cargar el grupo" : "Grupo no encontrado"}
          </Text>
          <Button mode="contained" onPress={() => router.back()}>Volver</Button>
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
                <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            ) : null,
        }}
      />

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
          {/* Group Header */}
          <Surface style={[styles.headerCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
            <View style={styles.headerRow}>
              <Surface style={[styles.groupIcon, { backgroundColor: theme.colors.surface }]} elevation={0}>
                <Text style={styles.groupIconText}>{group.icon || "🏆"}</Text>
              </Surface>
              <View style={styles.headerInfo}>
                <Text variant="titleLarge" style={{ fontWeight: "700" }}>
                  {group.name}
                </Text>
                {group.description && (
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                    {group.description}
                  </Text>
                )}
                <View style={styles.badgeRow}>
                  {isOwner && (
                    <Chip icon="star" compact style={{ backgroundColor: 'rgba(255, 215, 0, 0.15)' }}>
                      Creador
                    </Chip>
                  )}
                  {isAdmin && !isOwner && (
                    <Chip icon="shield-check" compact>
                      Admin
                    </Chip>
                  )}
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {group.member_count} miembros
                  </Text>
                </View>
              </View>
            </View>
          </Surface>

          {/* Members Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={{ fontWeight: "600" }}>
                Miembros
              </Text>
              <Button mode="text" compact onPress={handleInvite} icon="account-plus">
                Invitar
              </Button>
            </View>

            <Card mode="outlined">
              <Card.Content>
                {group.members.length > 0 ? (
                  <View style={styles.membersList}>
                    {group.members.map((member) => {
                      const isMemberOwner = member.role === 'owner';
                      const canRemove = isAdmin && !isMemberOwner && (isOwner || member.role !== 'admin');
                      
                      return (
                        <View key={member.user_id} style={styles.memberRow}>
                          <MemberAvatar user={member} size="sm" />
                          <View style={styles.memberInfo}>
                            <Text variant="bodyMedium" style={{ fontWeight: "500" }}>
                              {member.display_name}
                            </Text>
                            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                              {member.role === 'owner' ? 'Propietario' : member.role === 'admin' ? 'Admin' : 'Miembro'}
                            </Text>
                          </View>
                          {canRemove && (
                            <TouchableOpacity
                              style={styles.kickButton}
                              onPress={() => {
                                Alert.alert(
                                  "Expulsar miembro",
                                  `¿Seguro que quieres expulsar a ${member.display_name} del grupo?`,
                                  [
                                    { text: "Cancelar", style: "cancel" },
                                    {
                                      text: "Expulsar",
                                      style: "destructive",
                                      onPress: async () => {
                                        try {
                                          await removeMember(member.user_id);
                                        } catch {
                                          Alert.alert("Error", "No se pudo expulsar al miembro");
                                        }
                                      }
                                    }
                                  ]
                                );
                              }}
                            >
                              <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text variant="bodyMedium" style={{ textAlign: "center", color: theme.colors.onSurfaceVariant }}>
                    No hay miembros aún
                  </Text>
                )}
              </Card.Content>
            </Card>
          </View>

          {/* Awards Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={{ fontWeight: "600" }}>
                Premios
              </Text>
              <Surface style={[styles.awardBadge, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {group.awards?.length || 0}
                </Text>
              </Surface>
            </View>

            {!group.awards || group.awards.length === 0 ? (
              <Card mode="outlined">
                <Card.Content style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🏆</Text>
                  <Text variant="titleMedium">No hay premios aún</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, textAlign: "center" }}>
                    {isAdmin
                      ? "Crea el primer premio para este grupo"
                      : "El administrador aún no ha creado premios"}
                  </Text>
                  {isAdmin && (
                    <Button mode="contained" onPress={handleCreateAward} style={{ marginTop: 16 }}>
                      + Crear Premio
                    </Button>
                  )}
                </Card.Content>
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
          <FAB
            icon="plus"
            style={[styles.fab, { bottom: 24 + insets.bottom }]}
            onPress={handleCreateAward}
          />
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
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: appTheme.spacing.lg,
  },
  headerButton: {
    padding: 8,
  },
  headerCard: {
    borderRadius: appTheme.borderRadius.lg,
    padding: appTheme.spacing.lg,
    marginBottom: appTheme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIcon: {
    width: 64,
    height: 64,
    borderRadius: appTheme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: appTheme.spacing.md,
  },
  groupIconText: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
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
  awardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: appTheme.borderRadius.full,
  },
  membersList: {
    gap: appTheme.spacing.xs,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: appTheme.spacing.xs,
  },
  memberInfo: {
    flex: 1,
    marginLeft: appTheme.spacing.sm,
  },
  kickButton: {
    padding: appTheme.spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: appTheme.spacing.md,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: appTheme.spacing.sm,
  },
  fab: {
    position: "absolute",
    right: 24,
  },
});
