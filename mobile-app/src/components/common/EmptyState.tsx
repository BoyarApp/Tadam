import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@theme';
import { isTamil } from '@i18n';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
  emoji?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  illustration,
  emoji = '📭',
}) => {
  const tamil = isTamil();

  return (
    <View style={styles.container}>
      {illustration ? (
        illustration
      ) : (
        <Text style={styles.emoji}>{emoji}</Text>
      )}

      <Text
        style={[
          styles.title,
          tamil ? theme.tamilTypography.h3 : theme.englishTypography.h3,
        ]}
      >
        {title}
      </Text>

      {message && (
        <Text
          style={[
            styles.message,
            tamil ? theme.tamilTypography.body : theme.englishTypography.body,
          ]}
        >
          {message}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  actionButton: {
    minWidth: 160,
  },
});
