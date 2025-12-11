import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { theme } from '../constants/theme';
import { Group } from '../types';
import { Card } from './ui/Card';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card variant="elevated" padding="md" style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{group.icon || '🏆'}</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>{group.name}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="people" size={14} color={Colors.textSecondary} />
              <Text style={styles.members}>{group.memberCount} miembros</Text>
              {group.awards.length > 0 && (
                <>
                  <View style={styles.dot} />
                  <Ionicons name="trophy" size={14} color={Colors.gold} />
                  <Text style={styles.awards}>{group.awards.length} premios</Text>
                </>
              )}
            </View>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  members: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textLight,
    marginHorizontal: 6,
  },
  awards: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
