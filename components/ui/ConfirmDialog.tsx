import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  showCancel?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  type = 'info',
  showCancel = true,
}) => {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // Reset to 0 first to ensure animation works every time
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible, scaleAnim, opacityAnim]);

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'error':
        return { name: 'alert-circle', color: theme.colors.error };
      case 'warning':
        return { name: 'alert', color: '#FF9800' };
      case 'confirm':
        return { name: 'help-circle', color: theme.colors.primary };
      default:
        return { name: 'information', color: theme.colors.primary };
    }
  };

  const iconConfig = getIconConfig();

  if (!shouldRender) return null;

  return (
    <Portal>
      <View style={styles.container}>
        {/* Backdrop - handles dismiss on tap outside */}
        <Pressable style={styles.backdrop} onPress={onCancel}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}>
            <BlurView 
              intensity={30} 
              tint="dark"
              style={StyleSheet.absoluteFill}
              experimentalBlurMethod="dimezisBlurView" 
            />
          </Animated.View>
        </Pressable>
        
        {/* Dialog */}
        <Animated.View
          style={[
            styles.dialogContainer,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              elevation: 24, // High elevation for Android z-index
              zIndex: 10,   // Explicit z-index
            },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}15` }]}>
            <MaterialCommunityIcons
              name={iconConfig.name as any}
              size={48}
              color={iconConfig.color}
            />
          </View>

          {/* Title */}
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>

          {/* Message */}
          <Text
            variant="bodyMedium"
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            {message}
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            {showCancel && (
              <Button
                mode="text"
                onPress={onCancel}
                style={styles.button}
                labelStyle={{ color: theme.colors.onSurfaceVariant }}
              >
                {cancelText}
              </Button>
            )}
            {onConfirm && (
              <Button
                mode="contained"
                onPress={() => {
                  onConfirm();
                  onCancel();
                }}
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: theme.colors.onPrimary }}
              >
                {confirmText}
              </Button>
            )}
          </View>
        </Animated.View>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    width: '100%',
  },
  button: {
    minWidth: 80,
  },
});
