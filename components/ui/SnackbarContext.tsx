import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { Snackbar, Text, useTheme } from 'react-native-paper';

interface SnackbarContextType {
  showSnackbar: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
};

interface SnackbarProviderProps {
  children: React.ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'info'>('info');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Listen for keyboard show/hide
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const showSnackbar = useCallback((msg: string, snackType: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setType(snackType);
    setVisible(true);
  }, []);

  const hideSnackbar = useCallback(() => {
    setVisible(false);
  }, []);

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.primaryContainer,
          iconName: 'checkmark-circle' as const,
          iconColor: theme.colors.primary,
          textColor: theme.colors.onPrimaryContainer,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.errorContainer,
          iconName: 'alert-circle' as const,
          iconColor: theme.colors.error,
          textColor: theme.colors.onErrorContainer,
        };
      default:
        return {
          backgroundColor: theme.colors.surfaceVariant,
          iconName: 'information-circle' as const,
          iconColor: theme.colors.primary,
          textColor: theme.colors.onSurfaceVariant,
        };
    }
  };

  const config = getConfig();

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={4000}
        action={{
          label: 'OK',
          onPress: hideSnackbar,
          textColor: config.iconColor,
        }}
        style={[
          styles.snackbar, 
          { 
            backgroundColor: config.backgroundColor,
            marginBottom: keyboardHeight > 0 ? keyboardHeight + 16 : 16,
          }
        ]}
      >
        <View style={styles.content}>
          <Ionicons name={config.iconName} size={20} color={config.iconColor} style={styles.icon} />
          <Text style={[styles.text, { color: config.textColor }]}>{message}</Text>
        </View>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
