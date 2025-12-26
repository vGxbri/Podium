import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultGroupIcon, getIconComponent, groupIconOptions, IconName } from "../../../../constants/icons";
import { theme as appTheme } from "../../../../constants/theme";
import { useGroup } from "../../../../hooks";

import { ConfirmDialog, DialogType } from "../../../../components/ui/ConfirmDialog";
import { useSnackbar } from "../../../../components/ui/SnackbarContext";

export default function GroupSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  
  const { 
    group, 
    isLoading, 
    updateGroup, 
    deleteGroup, 
    isAdmin, 
    isOwner 
  } = useGroup(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<IconName>(defaultGroupIcon);
  
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: DialogType;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
  });

  const hideDialog = () => setDialogConfig(prev => ({ ...prev, visible: false }));
  
  // Settings
  const [allowMemberNominations, setAllowMemberNominations] = useState(false);
  const [allowMemberVoting, setAllowMemberVoting] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || "");
      setIcon((group.icon as IconName) || defaultGroupIcon);
      setAllowMemberNominations(group.settings.allow_member_nominations);
      setAllowMemberVoting(group.settings.allow_member_voting);
      setRequireApproval(group.settings.require_approval);
    }
  }, [group]);

  const handleSave = async () => {
    if (!name.trim()) {
      showSnackbar("El nombre del grupo es obligatorio", "error");
      return;
    }

    try {
      setSaving(true);
      await updateGroup({
        name: name.trim(),
        description: description.trim() || null,
        icon,
        settings: {
          allow_member_nominations: allowMemberNominations,
          allow_member_voting: allowMemberVoting,
          require_approval: requireApproval,
        }
      });
      showSnackbar("Grupo actualizado correctamente", "success");
      router.back();
    } catch (error: any) {
      showSnackbar(error.message || "No se pudo actualizar el grupo", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setDialogConfig({
      visible: true,
      title: "Eliminar Grupo",
      message: "¿Estás seguro? Esta acción eliminará el grupo y todos sus datos permanentemente.",
      type: "error",
      confirmText: "Eliminar",
      onConfirm: async () => {
        try {
          setSaving(true);
          await deleteGroup();
          router.dismissAll();
          router.replace("/(tabs)/home");
        } catch {
          setSaving(false);
          showSnackbar("No se pudo eliminar el grupo", "error");
        }
      }
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!group || !isAdmin) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge">No tienes permisos para ver esta pantalla</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Ajustes del Grupo" }} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: appTheme.spacing.xl + insets.bottom }
            ]}
          >
            {/* General Info */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={{ fontWeight: "600", marginBottom: 16 }}>
                Información General
              </Text>
              
              <View style={styles.iconSelector}>
                <Text variant="labelLarge" style={{ marginBottom: 8 }}>Icono</Text>
                <View style={styles.iconGrid}>
                  {groupIconOptions.map((iconName) => (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconOption,
                        { 
                          backgroundColor: icon === iconName ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                          borderColor: icon === iconName ? theme.colors.primary : 'transparent'
                        }
                      ]}
                      onPress={() => setIcon(iconName)}
                    >
                      {getIconComponent(iconName, 24, icon === iconName ? theme.colors.primary : theme.colors.onSurfaceVariant)}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                label="Nombre del Grupo"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Descripción"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </View>

            {/* Permissions / Settings */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={{ fontWeight: "600", marginBottom: 16 }}>
                Permisos y Configuración
              </Text>
              
              <Card mode="outlined" style={{ marginBottom: 8 }}>
                <Card.Content style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text variant="bodyLarge">Permitir nominaciones de miembros</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Los miembros pueden nominar a otros para premios
                    </Text>
                  </View>
                  <Switch
                    value={allowMemberNominations}
                    onValueChange={setAllowMemberNominations}
                  />
                </Card.Content>
              </Card>

              <Card mode="outlined" style={{ marginBottom: 8 }}>
                <Card.Content style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text variant="bodyLarge">Permitir votación de miembros</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Los miembros pueden votar en los premios activos
                    </Text>
                  </View>
                  <Switch
                    value={allowMemberVoting}
                    onValueChange={setAllowMemberVoting}
                  />
                </Card.Content>
              </Card>

              <Card mode="outlined">
                <Card.Content style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text variant="bodyLarge">Requerir aprobación</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Los nuevos miembros deben ser aprobados por un admin
                    </Text>
                  </View>
                  <Switch
                    value={requireApproval}
                    onValueChange={setRequireApproval}
                  />
                </Card.Content>
              </Card>
            </View>

            {/* Danger Zone */}
            {isOwner && (
              <Card mode="outlined" style={[styles.dangerSection, { borderColor: theme.colors.error }]}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ color: theme.colors.error, marginBottom: 12 }}>
                    Zona de Peligro
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={handleDelete}
                    loading={saving}
                    textColor={theme.colors.error}
                    style={{ borderColor: theme.colors.error }}
                  >
                    Eliminar Grupo
                  </Button>
                </Card.Content>
              </Card>
            )}

          </ScrollView>

          <View style={[styles.footer, { paddingBottom: appTheme.spacing.lg + insets.bottom, backgroundColor: theme.colors.surface }]}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
            >
              Guardar Cambios
            </Button>
          </View>
        </KeyboardAvoidingView>
      </View>
      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        onConfirm={dialogConfig.onConfirm}
        onCancel={hideDialog}
        showCancel={true}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: appTheme.spacing.lg,
  },
  section: {
    marginBottom: appTheme.spacing.xl,
  },
  iconSelector: {
    marginBottom: appTheme.spacing.md,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  iconText: {
    fontSize: 24,
  },
  input: {
    marginBottom: appTheme.spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
    paddingRight: appTheme.spacing.md,
  },
  dangerSection: {
    marginTop: appTheme.spacing.xl,
  },
  footer: {
    padding: appTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
