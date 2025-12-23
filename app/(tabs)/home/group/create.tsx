import { useRouter } from "expo-router";
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
  Button,
  Card,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultGroupIcon, getIconComponent, groupIconOptions, IconName } from "../../../../constants/icons";
import { theme as appTheme } from "../../../../constants/theme";
import { groupsService } from "../../../../services";

export default function CreateGroupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconName>(defaultGroupIcon);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      
      const newGroup = await groupsService.createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
      });
      
      router.replace({
        pathname: "/home/group/[id]",
        params: { id: newGroup.id }
      });
    } catch (err) {
      console.error("Error creating group:", err);
      const message = err instanceof Error ? err.message : "Error al crear el grupo";
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
            <Text variant="labelLarge" style={{ marginBottom: 12 }}>
              Icono del grupo
            </Text>
            <View style={styles.iconGrid}>
              {groupIconOptions.map((iconName) => (
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

          {/* Group Name */}
          <TextInput
            label="Nombre del grupo"
            placeholder="ej. Los Cracks"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          {/* Description */}
          <TextInput
            label="Descripción (opcional)"
            placeholder="Describe tu grupo..."
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          {/* Info */}
          <Card mode="outlined" style={styles.infoBox}>
            <Card.Content style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {getIconComponent("celebration", 20, theme.colors.primary)}
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
                Serás administrador del grupo automáticamente
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Submit Button */}
        <Surface style={[styles.footer, { paddingBottom: appTheme.spacing.lg + insets.bottom, backgroundColor: theme.colors.surface }]} elevation={1}>
          <Button
            mode="contained"
            onPress={handleCreate}
            loading={loading}
            disabled={!name.trim()}
          >
            Crear Grupo
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
  infoBox: {
    marginTop: appTheme.spacing.md,
  },
  footer: {
    padding: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.md,
  },
});
