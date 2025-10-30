import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '@theme';
import { isTamil } from '@i18n';

interface LoadingStateProps {
  size?: 'small' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'large',
  text,
  fullScreen = false,
}) => {
  const tamil = isTamil();

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {text && (
        <Text
          style={[
            styles.text,
            tamil ? theme.tamilTypography.body : theme.englishTypography.body,
          ]}
        >
          {text}
        </Text>
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
  text: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});
