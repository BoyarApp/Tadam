import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { theme } from '@theme';
import { isTamil } from '@i18n';
import { District } from '@types';

interface DistrictCheckboxProps {
  district: District;
  selected?: boolean;
  onToggle?: (district: District) => void;
  disabled?: boolean;
  showState?: boolean;
}

export const DistrictCheckbox: React.FC<DistrictCheckboxProps> = ({
  district,
  selected = false,
  onToggle,
  disabled = false,
  showState = true,
}) => {
  const tamil = isTamil();

  return (
    <Pressable
      onPress={() => onToggle?.(district)}
      disabled={disabled || !onToggle}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
        disabled && styles.containerDisabled,
      ]}
    >
      {/* Checkbox */}
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {/* District info */}
      <View style={styles.info}>
        <Text
          style={[
            tamil ? theme.tamilTypography.body : theme.englishTypography.body,
            styles.name,
          ]}
        >
          {district.name}
        </Text>

        {showState && district.state && (
          <Text
            style={[
              tamil
                ? theme.tamilTypography.caption
                : theme.englishTypography.caption,
              styles.state,
            ]}
          >
            {district.state}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  containerPressed: {
    backgroundColor: theme.colors.surfaceLight,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  state: {
    color: theme.colors.textSecondary,
  },
});
