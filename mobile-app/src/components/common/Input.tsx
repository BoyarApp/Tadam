import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { theme } from '@theme';
import { isTamil } from '@i18n';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const tamil = isTamil();
  const hasError = !!error;

  const getInputContainerStyle = () => {
    const styles: ViewStyle[] = [baseStyles.inputContainer];

    if (isFocused) {
      styles.push(baseStyles.inputContainerFocused);
    }

    if (hasError) {
      styles.push(baseStyles.inputContainerError);
    }

    return styles;
  };

  return (
    <View style={[baseStyles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            tamil ? theme.tamilTypography.label : theme.englishTypography.label,
            baseStyles.label,
            hasError && baseStyles.labelError,
          ]}
        >
          {label}
        </Text>
      )}

      <View style={getInputContainerStyle()}>
        {leftIcon && <View style={baseStyles.iconLeft}>{leftIcon}</View>}

        <TextInput
          {...textInputProps}
          style={[
            baseStyles.input,
            tamil ? theme.tamilTypography.body : theme.englishTypography.body,
            leftIcon && { paddingLeft: 0 },
            rightIcon && { paddingRight: 0 },
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {rightIcon && <View style={baseStyles.iconRight}>{rightIcon}</View>}
      </View>

      {(error || helperText) && (
        <Text
          style={[
            tamil ? theme.tamilTypography.caption : theme.englishTypography.caption,
            baseStyles.helperText,
            hasError && baseStyles.errorText,
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  labelError: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.sm,
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
  helperText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
  },
});
