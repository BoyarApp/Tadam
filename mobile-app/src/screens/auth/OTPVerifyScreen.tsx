import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Button, LoadingState } from '@components/common';
import { AuthStackParamList } from '@types';
import { useVerifyOTP, useSendOTP } from '@api/hooks/useAuth';
import { otpSchema } from '@utils/validation';
import { z } from 'zod';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerify'>;

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 60; // seconds

export const OTPVerifyScreen: React.FC<Props> = ({ route, navigation }) => {
  const tamil = isTamil();
  const { phone, countryCode } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const verifyOTPMutation = useVerifyOTP();
  const sendOTPMutation = useSendOTP();

  // Resend timer
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every((digit) => digit) && index === OTP_LENGTH - 1) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');

    try {
      // Validate OTP
      otpSchema.parse(code);
      setError('');

      // Verify OTP
      await verifyOTPMutation.mutateAsync({
        phone,
        code,
        countryCode,
      });

      // Navigation handled by auth state change
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || t('errors.invalidOTP'));
      } else {
        setError(t('errors.verifyOTP'));
      }
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendOTPMutation.mutateAsync({
        phone,
        countryCode,
      });

      setResendTimer(RESEND_TIMEOUT);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert(t('common.success'), t('auth.otpResent'));
    } catch (err) {
      Alert.alert(t('errors.title'), t('errors.sendOTP'));
    }
  };

  if (verifyOTPMutation.isPending) {
    return <LoadingState fullScreen text={t('auth.verifying')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text
            style={[
              tamil ? theme.tamilTypography.h2 : theme.englishTypography.h2,
              styles.title,
            ]}
          >
            {t('auth.verifyOTP')}
          </Text>
          <Text
            style={[
              tamil
                ? theme.tamilTypography.body
                : theme.englishTypography.body,
              styles.subtitle,
            ]}
          >
            {t('auth.otpSentTo', { phone: `${countryCode} ${phone}` })}
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                tamil
                  ? theme.tamilTypography.h2
                  : theme.englishTypography.h2,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Error */}
        {error && (
          <Text
            style={[
              tamil
                ? theme.tamilTypography.body
                : theme.englishTypography.body,
              styles.error,
            ]}
          >
            {error}
          </Text>
        )}

        {/* Verify Button */}
        <Button
          title={t('auth.verify')}
          onPress={() => handleVerify()}
          loading={verifyOTPMutation.isPending}
          disabled={otp.some((digit) => !digit) || verifyOTPMutation.isPending}
          variant="primary"
          size="large"
          fullWidth
          style={styles.verifyButton}
        />

        {/* Resend */}
        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.body
                  : theme.englishTypography.body,
                styles.resendText,
              ]}
            >
              {t('auth.resendIn', { seconds: resendTimer })}
            </Text>
          ) : (
            <Button
              title={t('auth.resendOTP')}
              onPress={handleResendOTP}
              loading={sendOTPMutation.isPending}
              disabled={sendOTPMutation.isPending}
              variant="ghost"
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  otpInputFilled: {
    borderColor: theme.colors.primary,
  },
  error: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  verifyButton: {
    marginBottom: theme.spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    color: theme.colors.textSecondary,
  },
});
