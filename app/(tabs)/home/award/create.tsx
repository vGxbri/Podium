import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
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
    Checkbox,
    Surface,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MemberAvatar } from "../../../../components/MemberAvatar";
import { awardIconOptions, defaultAwardIcon, getIconComponent, IconName } from "../../../../constants/icons";
import { theme as appTheme } from "../../../../constants/theme";
import { useGroup } from "../../../../hooks";
import { awardsService } from "../../../../services";

export default function CreateAwardScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  const { group, isLoading: groupLoading } = useGroup(groupId);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconName>(defaultAwardIcon);
  const [selectedNominees, setSelectedNominees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Loading state
  if (groupLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Cargando...
          </Text>
        </View>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.notFound}>
          <Ionicons name="warning-outline" size={48} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyLarge" style={{ marginVertical: 16, color: theme.colors.onSurfaceVariant }}>
            Grupo no encontrado
          </Text>
          <Button mode="contained" onPress={() => router.back()}>Volver</Button>
        </View>
      </View>
    );
  }

  const toggleNominee = (userId: string) => {
    setSelectedNominees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || selectedNominees.length < 2 || !groupId) return;

    try {
      setLoading(true);
      
      await awardsService.createAward({
        group_id: groupId,
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
        nominee_ids: selectedNominees,
      });
      
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear el premio";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon Selector */}
          <View style={styles.section}>
            <Text variant="labelLarge" style={{ marginBottom: 8 }}>
              Icono del premio
            </Text>
            <View style={styles.iconGrid}>
              {awardIconOptions.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconButton,
                    { 
                      backgroundColor: selectedIcon === iconName ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                      borderColor: selectedIcon === iconName ? theme.colors.primary : 'transparent'
                    },
                  ]}
                  onPress={() => setSelectedIcon(iconName)}
                >
                  {getIconComponent(
                    iconName, 
                    28, 
                    selectedIcon === iconName ? theme.colors.primary : theme.colors.onSurfaceVariant
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Award Name */}
          <TextInput
            label="Nombre del premio"
            placeholder="ej. Mejor Amigo del Año"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          {/* Description */}
          <TextInput
            label="Descripción (opcional)"
            placeholder="Describe este premio..."
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          {/* Nominees Section */}
          <View style={styles.section}>
            <View style={styles.nomineesHeader}>
              <Text variant="labelLarge">Seleccionar nominados</Text>
              <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                {selectedNominees.length} seleccionados
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
              Mínimo 2 nominados requeridos
            </Text>

            <Card mode="outlined">
              <Card.Content>
                {group.members.length === 0 ? (
                  <Text variant="bodyMedium" style={{ textAlign: "center", color: theme.colors.onSurfaceVariant }}>
                    No hay miembros en el grupo
                  </Text>
                ) : (
                  group.members.map((member) => {
                    const isSelected = selectedNominees.includes(member.user_id);
                    return (
                      <TouchableOpacity
                        key={member.user_id}
                        style={[
                          styles.nomineeRow,
                          isSelected && { backgroundColor: theme.colors.secondaryContainer },
                        ]}
                        onPress={() => toggleNominee(member.user_id)}
                        activeOpacity={0.7}
                      >
                        <MemberAvatar user={member} size="sm" />
                        <Text variant="bodyMedium" style={{ flex: 1, marginLeft: 12 }}>
                          {member.display_name}
                        </Text>
                        <Checkbox
                          status={isSelected ? 'checked' : 'unchecked'}
                          onPress={() => toggleNominee(member.user_id)}
                        />
                      </TouchableOpacity>
                    );
                  })
                )}
              </Card.Content>
            </Card>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <Surface style={[styles.footer, { paddingBottom: appTheme.spacing.lg + insets.bottom, backgroundColor: theme.colors.surface }]} elevation={1}>
          <Button
            mode="contained"
            onPress={handleCreate}
            loading={loading}
            disabled={!name.trim() || selectedNominees.length < 2}
          >
            Crear Premio
          </Button>
        </Surface>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  section: {
    marginBottom: appTheme.spacing.lg,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appTheme.spacing.sm,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: appTheme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  input: {
    marginBottom: appTheme.spacing.md,
  },
  nomineesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nomineeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: appTheme.spacing.sm,
    borderRadius: appTheme.borderRadius.md,
    marginBottom: 2,
  },
  footer: {
    padding: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.md,
  },
});
