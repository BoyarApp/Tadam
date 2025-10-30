import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { theme } from '@theme';
import { isTamil } from '@i18n';
import { Category } from '@types';

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onPress?: (category: Category) => void;
  disabled?: boolean;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  selected = false,
  onPress,
  disabled = false,
}) => {
  const tamil = isTamil();

  return (
    <Pressable
      onPress={() => onPress?.(category)}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.container,
        selected && styles.containerSelected,
        pressed && styles.containerPressed,
        disabled && styles.containerDisabled,
      ]}
    >
      {/* Icon/Emoji */}
      {category.emoji && <Text style={styles.emoji}>{category.emoji}</Text>}

      {/* Name */}
      <Text
        style={[
          tamil ? theme.tamilTypography.body : theme.englishTypography.body,
          styles.text,
          selected && styles.textSelected,
        ]}
      >
        {category.name}
      </Text>

      {/* Selection indicator */}
      {selected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  containerSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  containerPressed: {
    opacity: 0.7,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 16,
  },
  text: {
    color: theme.colors.textPrimary,
  },
  textSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
