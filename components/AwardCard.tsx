import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Chip, Surface, Text, useTheme } from 'react-native-paper';
import { theme as appTheme } from '../constants/theme';
import { Award, AwardWithNominees } from '../types/database';

interface AwardCardProps {
  award: Award | AwardWithNominees;
  nomineeCount?: number;
  onPress?: () => void;
}

export const AwardCard: React.FC<AwardCardProps> = ({ award, nomineeCount, onPress }) => {
  const theme = useTheme();
  
  const statusConfig: Record<string, { label: string; color: string; icon: 'document-outline' | 'checkmark-circle' | 'hourglass' | 'trophy' | 'archive-outline' }> = {
    draft: { label: 'Borrador', color: theme.colors.onSurfaceVariant, icon: 'document-outline' },
    nominations: { label: 'Nominaciones', color: theme.colors.tertiary, icon: 'document-outline' },
    voting: { label: 'Votando', color: '#F59E0B', icon: 'hourglass' },
    completed: { label: 'Completado', color: theme.colors.primary, icon: 'trophy' },
    archived: { label: 'Archivado', color: theme.colors.onSurfaceVariant, icon: 'archive-outline' },
  };

  const status = statusConfig[award.status] || statusConfig.draft;
  const nominees = 'nominees' in award ? award.nominees.length : (nomineeCount || 0);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.8 : 1} disabled={!onPress}>
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Surface style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
              <Text style={styles.icon}>{award.icon || '🏆'}</Text>
            </Surface>
            <Chip 
              compact 
              icon={() => <Ionicons name={status.icon} size={12} color={status.color} />}
              textStyle={{ fontSize: 11, color: status.color }}
              style={{ backgroundColor: theme.colors.surfaceVariant }}
            >
              {status.label}
            </Chip>
          </View>
          
          <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 4 }}>
            {award.name}
          </Text>
          
          {award.description && (
            <Text 
              variant="bodySmall" 
              numberOfLines={1} 
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
            >
              {award.description}
            </Text>
          )}
          
          <View style={styles.footer}>
            <Ionicons name="people" size={14} color={theme.colors.onSurfaceVariant} />
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {nominees} nominados
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: appTheme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: appTheme.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: appTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
});
