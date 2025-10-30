import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@theme';
import { isTamil } from '@i18n';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  const tamil = isTamil();

  const getContainerStyle = (): ViewStyle[] => {
    const styles: ViewStyle[] = [baseStyles.container];

    // Variant styles
    if (variant === 'primary') {
      styles.push(baseStyles.primaryContainer);
    } else if (variant === 'secondary') {
      styles.push(baseStyles.secondaryContainer);
    } else if (variant === 'outline') {
      styles.push(baseStyles.outlineContainer);
    } else if (variant === 'ghost') {
      styles.push(baseStyles.ghostContainer);
    }

    // Size styles
    if (size === 'small') {
      styles.push(baseStyles.smallContainer);
    } else if (size === 'medium') {
      styles.push(baseStyles.mediumContainer);
    } else if (size === 'large') {
      styles.push(baseStyles.largeContainer);
    }

    // State styles
    if (isDisabled) {
      styles.push(baseStyles.disabledContainer);
    }

    if (fullWidth) {
      styles.push(baseStyles.fullWidth);
    }

    if (style) {
      styles.push(style);
    }

    return styles;
  };

  const getTextStyle = (): TextStyle[] => {
    const styles: TextStyle[] = [
      tamil ? theme.tamilTypography.button : theme.englishTypography.button,
    ];

    // Variant text styles
    if (variant === 'primary') {
      styles.push(baseStyles.primaryText);
    } else if (variant === 'secondary') {
      styles.push(baseStyles.secondaryText);
    } else if (variant === 'outline') {
      styles.push(baseStyles.outlineText);
    } else if (variant === 'ghost') {
      styles.push(baseStyles.ghostText);
    }

    // Size text styles
    if (size === 'small') {
      styles.push({ fontSize: theme.fontSizes.sm });
    } else if (size === 'large') {
      styles.push({ fontSize: theme.fontSizes.lg });
    }

    // State text styles
    if (isDisabled) {
      styles.push(baseStyles.disabledText);
    }

    if (textStyle) {
      styles.push(textStyle);
    }

    return styles;
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.white : theme.colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },

  // Variant styles
  primaryContainer: {
    backgroundColor: theme.colors.primary,
  },
  secondaryContainer: {
    backgroundColor: theme.colors.surface,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },

  // Size styles
  smallContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    minHeight: 36,
  },
  mediumContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    minHeight: 44,
  },
  largeContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    minHeight: 52,
  },

  // State styles
  disabledContainer: {
    opacity: 0.5,
  },

  // Text styles
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.textPrimary,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  ghostText: {
    color: theme.colors.primary,
  },
  disabledText: {
    opacity: 0.6,
  },
});
