import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React from "react";
import {
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { theme } from "../constants/theme";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  inviteCode: string;
  groupName: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  visible,
  onClose,
  inviteCode,
  groupName,
}) => {
  // App link for sharing and copying
  const appLink = `podium://join/${inviteCode}`;

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(appLink);
    // Could show a toast here
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Únete a mi grupo "${groupName}" en Podium! 🏆\n\nAbre este enlace en tu móvil:\n${appLink}\n\nO usa el código: ${inviteCode}`,
        title: `Únete a ${groupName} en Podium`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Card variant="elevated" padding="lg">
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Invitar Amigos</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* QR Code Placeholder */}
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code" size={80} color={Colors.primary} />
                <Text style={styles.qrCode}>{inviteCode}</Text>
              </View>
            </View>

            {/* Link Section */}
            <View style={styles.linkSection}>
              <Text style={styles.linkLabel}>Enlace de invitación</Text>
              <View style={styles.linkRow}>
                <Text style={styles.linkText} numberOfLines={1}>
                  {appLink}
                </Text>
                <TouchableOpacity onPress={handleCopyLink} style={styles.copyButton}>
                  <Ionicons name="copy-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Share Button */}
            <Button
              title="Compartir"
              onPress={handleShare}
              icon={<Ionicons name="share-outline" size={20} color={Colors.textOnPrimary} />}
            />

            {/* Helper Text */}
            <Text style={styles.helperText}>
              Comparte este enlace con tus amigos para que se unan al grupo
            </Text>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  qrCode: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 2,
  },
  linkSection: {
    marginBottom: theme.spacing.lg,
  },
  linkLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  helperText: {
    marginTop: theme.spacing.md,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
