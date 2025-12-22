import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Colors } from "../../../../constants/Colors";
import { theme } from "../../../../constants/theme";
import { useGroup } from "../../../../hooks";

const predefinedIcons = ["🏆", "👥", "🏠", "💼", "🎮", "⚽", "🎵", "📚", "✈️", "❤️"];

export default function GroupSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
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
  const [icon, setIcon] = useState("🏆");
  
  // Settings
  const [allowMemberNominations, setAllowMemberNominations] = useState(false);
  const [allowMemberVoting, setAllowMemberVoting] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || "");
      setIcon(group.icon);
      setAllowMemberNominations(group.settings.allow_member_nominations);
      setAllowMemberVoting(group.settings.allow_member_voting);
      setRequireApproval(group.settings.require_approval);
    }
  }, [group]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del grupo es obligatorio");
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
      Alert.alert("Éxito", "Grupo actualizado correctamente");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar el grupo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Grupo",
      "¿Estás seguro? Esta acción eliminará el grupo y todos sus datos permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await deleteGroup();
              router.dismissAll();
              router.replace("/(tabs)/home");
            } catch (error: any) {
              setSaving(false);
              Alert.alert("Error", "No se pudo eliminar el grupo");
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!group || !isAdmin) {
    return (
      <View style={styles.centerContainer}>
        <Text>No tienes permisos para ver esta pantalla</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Ajustes del Grupo" }} />
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: theme.spacing.xl + insets.bottom }
            ]}
          >
            {/* General Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información General</Text>
              
              <View style={styles.iconSelector}>
                <Text style={styles.label}>Icono</Text>
                <View style={styles.iconGrid}>
                  {predefinedIcons.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.iconOption,
                        icon === item && styles.iconOptionSelected
                      ]}
                      onPress={() => setIcon(item)}
                    >
                      <Text style={styles.iconText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Input
                label="Nombre del Grupo"
                value={name}
                onChangeText={setName}
                placeholder="Nombre del grupo"
              />

              <Input
                label="Descripción"
                value={description}
                onChangeText={setDescription}
                placeholder="Descripción corta"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Permissions / Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Permisos y Configuración</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Permitir nominaciones de miembros</Text>
                  <Text style={styles.settingDescription}>
                    Los miembros pueden nominar a otros para premios
                  </Text>
                </View>
                <Switch
                  value={allowMemberNominations}
                  onValueChange={setAllowMemberNominations}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Permitir votación de miembros</Text>
                  <Text style={styles.settingDescription}>
                    Los miembros pueden votar en los premios activos
                  </Text>
                </View>
                <Switch
                  value={allowMemberVoting}
                  onValueChange={setAllowMemberVoting}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Requerir aprobación</Text>
                  <Text style={styles.settingDescription}>
                    Los nuevos miembros deben ser aprobados por un admin
                  </Text>
                </View>
                <Switch
                  value={requireApproval}
                  onValueChange={setRequireApproval}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                />
              </View>
            </View>

            {/* Danger Zone */}
            {isOwner && (
              <View style={styles.dangerSection}>
                <Text style={styles.dangerTitle}>Zona de Peligro</Text>
                <Button
                  title="Eliminar Grupo"
                  onPress={handleDelete}
                  variant="ghost"
                  textStyle={{ color: Colors.error }}
                  style={styles.deleteButton}
                  loading={saving}
                />
              </View>
            )}

          </ScrollView>

          <View style={[styles.footer, { paddingBottom: theme.spacing.lg + insets.bottom }]}>
            <Button
              title="Guardar Cambios"
              onPress={handleSave}
              loading={saving}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  iconSelector: {
    marginBottom: theme.spacing.md,
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
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundLight,
  },
  iconText: {
    fontSize: 24,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dangerSection: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.error,
    marginBottom: theme.spacing.md,
  },
  deleteButton: {
    borderColor: Colors.error,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
