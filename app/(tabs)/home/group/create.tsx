import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Colors } from "../../../../constants/Colors";
import { theme } from "../../../../constants/theme";
import { groupsService } from "../../../../services";

const groupIcons = ["🏆", "🎉", "⭐", "🎄", "🎯", "🔥", "💎", "🎭"];

export default function CreateGroupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🏆");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const newGroup = await groupsService.createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
      });
      
      // Navigate to the newly created group
      router.replace({
        pathname: "/home/group/[id]",
        params: { id: newGroup.id }
      });
    } catch (err) {
      console.error("Error creating group:", err);
      const message = err instanceof Error ? err.message : "Error al crear el grupo";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.label}>Icono del grupo</Text>
            <View style={styles.iconGrid}>
              {groupIcons.map((icon) => (
                <View
                  key={icon}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && styles.iconButtonSelected,
                  ]}
                >
                  <Text
                    style={styles.iconText}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    {icon}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Group Name */}
          <Input
            label="Nombre del grupo"
            placeholder="ej. Los Cracks"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Description */}
          <Input
            label="Descripción (opcional)"
            placeholder="Describe tu grupo..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🎉 Serás administrador del grupo automáticamente
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, { paddingBottom: theme.spacing.lg + insets.bottom }]}>
          <Button
            title="Crear Grupo"
            onPress={handleCreate}
            loading={loading}
            disabled={!name.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundLight,
  },
  iconText: {
    fontSize: 28,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  infoBox: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  footer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});
