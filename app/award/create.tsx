import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MemberAvatar } from "../../components/MemberAvatar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Colors } from "../../constants/Colors";
import { theme } from "../../constants/theme";
import { getGroupById } from "../../data/mockData";

const awardIcons = ["🏆", "🌟", "🎖️", "🥇", "👑", "💎", "🏅", "⭐"];

export default function CreateAwardScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  
  const group = getGroupById(groupId || "");
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🏆");
  const [selectedNominees, setSelectedNominees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  const toggleNominee = (userId: string) => {
    setSelectedNominees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || selectedNominees.length < 2) return;

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
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
            <Text style={styles.label}>Icono del premio</Text>
            <View style={styles.iconGrid}>
              {awardIcons.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && styles.iconButtonSelected,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Award Name */}
          <Input
            label="Nombre del premio"
            placeholder="ej. Mejor Amigo del Año"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Description */}
          <Input
            label="Descripción (opcional)"
            placeholder="Describe este premio..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />

          {/* Nominees Section */}
          <View style={styles.section}>
            <View style={styles.nomineesHeader}>
              <Text style={styles.label}>Seleccionar nominados</Text>
              <Text style={styles.nomineeCount}>
                {selectedNominees.length} seleccionados
              </Text>
            </View>
            <Text style={styles.helperText}>
              Mínimo 2 nominados requeridos
            </Text>

            <Card variant="glass" padding="sm" style={styles.nomineesCard}>
              {group.members.map((member) => {
                const isSelected = selectedNominees.includes(member.userId);
                return (
                  <TouchableOpacity
                    key={member.userId}
                    style={[
                      styles.nomineeRow,
                      isSelected && styles.nomineeRowSelected,
                    ]}
                    onPress={() => toggleNominee(member.userId)}
                    activeOpacity={0.7}
                  >
                    <MemberAvatar user={member.user} size="sm" />
                    <Text style={styles.nomineeName}>{member.user.name}</Text>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color={Colors.textOnPrimary} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Card>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title="Crear Premio"
            onPress={handleCreate}
            loading={loading}
            disabled={!name.trim() || selectedNominees.length < 2}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
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
    borderColor: Colors.gold,
    backgroundColor: Colors.backgroundLight,
  },
  iconText: {
    fontSize: 28,
  },
  nomineesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nomineeCount: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 12,
  },
  nomineesCard: {
    gap: 2,
  },
  nomineeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  nomineeRowSelected: {
    backgroundColor: Colors.backgroundLight,
  },
  nomineeName: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginLeft: theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});
