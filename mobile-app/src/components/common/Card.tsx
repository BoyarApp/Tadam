import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { theme } from '@theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof theme.spacing;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
  testID,
}) => {
  const getCardStyle = (): ViewStyle[] => {
    const styles: ViewStyle[] = [baseStyles.container];

    // Variant styles
    if (variant === 'elevated') {
      styles.push(baseStyles.elevated);
    } else if (variant === 'outlined') {
      styles.push(baseStyles.outlined);
    }

    // Padding
    styles.push({ padding: theme.spacing[padding] });

    if (style) {
      styles.push(style);
    }

    return styles;
  };

  const content = <View style={getCardStyle()}>{children}</View>;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const baseStyles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  elevated: {
    ...theme.shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
