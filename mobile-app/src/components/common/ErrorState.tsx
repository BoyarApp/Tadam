import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Button } from './Button';
import { APIError } from '@types';

interface ErrorStateProps {
  error?: Error | APIError;
  onRetry?: () => void;
  message?: string;
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  message,
  fullScreen = false,
}) => {
  const tamil = isTamil();

  const getErrorMessage = (): string => {
    if (message) return message;

    if (error) {
      if ('message' in error) {
        return error.message;
      }
    }

    return t('errors.generic');
  };

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <Text style={styles.emoji}>⚠️</Text>

      <Text
        style={[
          styles.title,
          tamil ? theme.tamilTypography.h3 : theme.englishTypography.h3,
        ]}
      >
        {t('errors.title')}
      </Text>

      <Text
        style={[
          styles.message,
          tamil ? theme.tamilTypography.body : theme.englishTypography.body,
        ]}
      >
        {getErrorMessage()}
      </Text>

      {onRetry && (
        <Button
          title={t('common.retry')}
          onPress={onRetry}
          variant="primary"
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  retryButton: {
    minWidth: 120,
  },
});
