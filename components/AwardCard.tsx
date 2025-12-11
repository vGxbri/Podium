import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { theme } from '../constants/theme';
import { Award } from '../types';
import { Card } from './ui/Card';

interface AwardCardProps {
  award: Award;
  onPress?: () => void;
}

const statusConfig = {
  draft: { label: 'Borrador', color: Colors.textLight, icon: 'document-outline' as const },
  active: { label: 'Activo', color: Colors.success, icon: 'checkmark-circle' as const },
  voting: { label: 'Votando', color: Colors.warning, icon: 'hourglass' as const },
  completed: { label: 'Completado', color: Colors.primary, icon: 'trophy' as const },
};

export const AwardCard: React.FC<AwardCardProps> = ({ award, onPress }) => {
  const status = statusConfig[award.status];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      <Card variant="glass" padding="md" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{award.icon || '🏆'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name={status.icon} size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>
        
        <Text style={styles.title}>{award.name}</Text>
        
        {award.description && (
          <Text style={styles.description} numberOfLines={1}>
            {award.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Ionicons name="people" size={14} color={Colors.textSecondary} />
          <Text style={styles.nominees}>
            {award.nominees.length} nominados
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  nominees: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
