import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { defaultAwardIcon, getIconComponent, IconName } from '../constants/icons';
import { Award, AwardWithNominees } from '../types/database';

interface AwardCardProps {
  award: Award | AwardWithNominees;
  nomineeCount?: number;
  onPress?: () => void;
}

export const AwardCard: React.FC<AwardCardProps> = ({ award, nomineeCount, onPress }) => {
  const theme = useTheme();
  const iconName = (award.icon as IconName) || defaultAwardIcon;
  
  const statusConfig: Record<string, { 
    label: string; 
    color: string; 
    bgColor: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = {
    draft: { 
      label: 'Borrador', 
      color: theme.colors.onSurfaceVariant, 
      bgColor: theme.colors.surfaceVariant,
      icon: 'document-outline' 
    },
    nominations: { 
      label: 'Nominaciones', 
      color: theme.colors.tertiary, 
      bgColor: `${theme.colors.tertiary}20`,
      icon: 'hand-right-outline' 
    },
    voting: { 
      label: 'Votando', 
      color: '#F59E0B', 
      bgColor: '#F59E0B20',
      icon: 'checkmark-circle-outline' 
    },
    completed: { 
      label: 'Completado', 
      color: '#22C55E', 
      bgColor: '#22C55E20',
      icon: 'trophy' 
    },
    archived: { 
      label: 'Archivado', 
      color: theme.colors.onSurfaceVariant, 
      bgColor: theme.colors.surfaceVariant,
      icon: 'archive-outline' 
    },
  };

  const status = statusConfig[award.status] || statusConfig.draft;
  const nominees = 'nominees' in award ? award.nominees.length : (nomineeCount || 0);

  // Get vote type label
  const getVoteTypeLabel = () => {
    switch (award.vote_type) {
      case 'photo': return 'Fotos';
      case 'video': return 'Videos';
      case 'audio': return 'Audios';
      case 'text': return 'Textos';
      default: return 'Personas';
    }
  };

  const getVoteTypeIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (award.vote_type) {
      case 'photo': return 'image-outline';
      case 'video': return 'videocam-outline';
      case 'audio': return 'musical-notes-outline';
      case 'text': return 'document-text-outline';
      default: return 'people-outline';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <Surface 
        style={[
          styles.card, 
          { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.secondaryContainer,
          }
        ]} 
        elevation={1}
      >
        {/* Top row: Icon + Title + Status */}
        <View style={styles.topRow}>
          <Surface 
            style={[
              styles.iconContainer, 
              { 
                backgroundColor: theme.colors.primaryContainer,
                borderColor: theme.colors.primary,
              }
            ]} 
            elevation={0}
          >
            {getIconComponent(iconName, 22, theme.colors.onSurface)}
          </Surface>
          
          <View style={styles.titleContainer}>
            <Text 
              variant="titleMedium" 
              numberOfLines={1}
              style={{ fontWeight: '700', color: theme.colors.onSurface, letterSpacing: -0.3 }}
            >
              {award.name}
            </Text>
            {award.description && (
              <Text 
                variant="bodySmall" 
                numberOfLines={1} 
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
              >
                {award.description}
              </Text>
            )}
          </View>
        </View>

        {/* Bottom row: Stats + Status Badge */}
        <View style={styles.bottomRow}>
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name={getVoteTypeIcon()} size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                {getVoteTypeLabel()}
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
            
            <View style={styles.statItem}>
              <Ionicons name="people" size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                {nominees} nominados
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Ionicons name={status.icon} size={12} color={status.color} />
            <Text 
              variant="labelSmall" 
              style={{ color: status.color, fontWeight: '600', marginLeft: 4 }}
            >
              {status.label}
            </Text>
          </View>
        </View>

        {/* Progress indicator for voting */}
        {award.status === 'voting' && (() => {
          const now = new Date().getTime();
          const start = award.voting_start_at ? new Date(award.voting_start_at).getTime() : now;
          const end = award.voting_end_at ? new Date(award.voting_end_at).getTime() : now + 24 * 60 * 60 * 1000;
          
          const totalDuration = end - start;
          const timeRemaining = Math.max(0, end - now);
          
          // If duration is 0 or negative, default to 0. 
          // Otherwise calculate percentage remaining.
          // Start -> Remaining = Total -> 100%
          // End -> Remaining = 0 -> 0%
          const progressPercent = totalDuration > 0 
            ? Math.min(100, Math.max(0, (timeRemaining / totalDuration) * 100)) 
            : 0;

          return (
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={[styles.progressFill, { backgroundColor: '#F59E0B', width: `${progressPercent}%` }]} />
            </View>
          );
        })()}

        {/* Chevron */}
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceVariant} />
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingRight: 24,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 12,
    marginHorizontal: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  chevronContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
});
