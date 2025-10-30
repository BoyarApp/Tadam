import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Button, Input } from '@components/common';
import { AuthStackParamList } from '@types';
import { useSendOTP } from '@api/hooks/useAuth';
import { phoneSchema } from '@utils/validation';
import { z } from 'zod';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneLogin'>;

export const PhoneLoginScreen: React.FC<Props> = ({ navigation }) => {
  const tamil = isTamil();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const sendOTPMutation = useSendOTP();

  const handleSendOTP = async () => {
    try {
      // Validate phone number
      phoneSchema.parse(phone);
      setError('');

      // Send OTP
      await sendOTPMutation.mutateAsync({
        phone,
        countryCode: '+91',
      });

      // Navigate to OTP verification
      navigation.navigate('OTPVerify', {
        phone,
        countryCode: '+91',
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || t('errors.invalidPhone'));
      } else {
        Alert.alert(t('errors.title'), t('errors.sendOTP'));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>📱</Text>
            <Text
              style={[
                tamil ? theme.tamilTypography.h2 : theme.englishTypography.h2,
                styles.title,
              ]}
            >
              {t('auth.phoneLogin')}
            </Text>
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.body
                  : theme.englishTypography.body,
                styles.subtitle,
              ]}
            >
              {t('auth.phoneLoginPrompt')}
            </Text>
          </View>

          {/* Phone Input */}
          <View style={styles.form}>
            <Input
              label={t('auth.phoneNumber')}
              value={phone}
              onChangeText={(value) => {
                setPhone(value);
                setError('');
              }}
              placeholder="9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              error={error}
              leftIcon={
                <Text
                  style={[
                    tamil
                      ? theme.tamilTypography.body
                      : theme.englishTypography.body,
                    styles.countryCode,
                  ]}
                >
                  +91
                </Text>
              }
            />

            <Button
              title={t('auth.sendOTP')}
              onPress={handleSendOTP}
              loading={sendOTPMutation.isPending}
              disabled={sendOTPMutation.isPending || phone.length !== 10}
              variant="primary"
              size="large"
              fullWidth
            />
          </View>

          {/* Helper Text */}
          <Text
            style={[
              tamil
                ? theme.tamilTypography.caption
                : theme.englishTypography.caption,
              styles.helperText,
            ]}
          >
            {t('auth.otpHelper')}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
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
  subtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  form: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  countryCode: {
    color: theme.colors.textPrimary,
  },
  helperText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
